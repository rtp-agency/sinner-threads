import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Сховище кошиків і замовлень. Два бекенди з однаковим інтерфейсом:
 * - Supabase (Postgres), коли задано NEXT_PUBLIC_SUPABASE_URL і SUPABASE_SECRET_KEY. Для прода.
 * - Файл .data/db.json: локальна розробка без жодних акаунтів.
 * Решта коду бачить тільки функції репозиторію нижче.
 */
export type CartLineRec = { productId: number; variantId: number; qty: number };

export type OrderStatus = "awaiting_payment" | "paid" | "payment_failed" | "placed";
export type OrderRec = {
  id: number;
  mode: "demo" | "live";
  status: OrderStatus;
  payment: "cod" | "card";
  provider: string | null;
  total: number;
  customer: { name: string; phone: string; city: string; warehouse: string; comment?: string };
  lines: { productId: number; variantId: number; qty: number; price: number; title: string; size: string; image: string }[];
  createdAt: number;
  history: { at: number; event: string }[];
};
export type NewOrderRec = Omit<OrderRec, "id" | "createdAt"> & { id?: number };

type Repo = {
  getCartLines(id: string): Promise<CartLineRec[]>;
  setCartLines(id: string, lines: CartLineRec[]): Promise<void>;
  insertOrder(o: NewOrderRec): Promise<OrderRec>;
  getOrder(id: number): Promise<OrderRec | null>;
  saveOrder(o: OrderRec): Promise<void>;
  listOrders(): Promise<OrderRec[]>;
};

// ---------- Supabase ----------
let sb: SupabaseClient | null = null;
function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return (sb ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }));
}

type OrderRow = { id: number; mode: OrderRec["mode"]; status: OrderStatus; payment: OrderRec["payment"]; provider: string | null; total: number; customer: OrderRec["customer"]; lines: OrderRec["lines"]; history: OrderRec["history"]; created_at: string };
const fromRow = (r: OrderRow): OrderRec => ({ id: Number(r.id), mode: r.mode, status: r.status, payment: r.payment, provider: r.provider, total: r.total, customer: r.customer, lines: r.lines, history: r.history, createdAt: new Date(r.created_at).getTime() });
const toRow = (o: NewOrderRec | OrderRec) => ({ ...(o.id ? { id: o.id } : {}), mode: o.mode, status: o.status, payment: o.payment, provider: o.provider, total: o.total, customer: o.customer, lines: o.lines, history: o.history });

function supabaseRepo(c: SupabaseClient): Repo {
  const must = <T,>(r: { data: T | null; error: { message: string } | null }) => {
    if (r.error) throw new Error(`Supabase: ${r.error.message}`);
    return r.data;
  };
  return {
    async getCartLines(id) {
      const d = must(await c.from("carts").select("lines").eq("id", id).maybeSingle()) as { lines: CartLineRec[] } | null;
      return d?.lines ?? [];
    },
    async setCartLines(id, lines) {
      must(await c.from("carts").upsert({ id, lines, updated_at: new Date().toISOString() }));
    },
    async insertOrder(o) {
      return fromRow(must(await c.from("orders").insert(toRow(o)).select().single()) as OrderRow);
    },
    async getOrder(id) {
      const d = must(await c.from("orders").select("*").eq("id", id).maybeSingle());
      return d ? fromRow(d as OrderRow) : null;
    },
    async saveOrder(o) {
      must(await c.from("orders").update(toRow(o)).eq("id", o.id));
    },
    async listOrders() {
      return (must(await c.from("orders").select("*").order("created_at", { ascending: false }).limit(200)) as OrderRow[]).map(fromRow);
    },
  };
}

// ---------- Файл (локально) ----------
type DB = { seq: number; carts: Record<string, { lines: CartLineRec[] }>; orders: Record<string, OrderRec> };
const FILE = path.join(process.cwd(), ".data", "db.json");
let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<DB> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as DB;
  } catch {
    return { seq: 1000, carts: {}, orders: {} };
  }
}
function mutate<T>(fn: (db: DB) => T): Promise<T> {
  const run = queue.then(async () => {
    const db = await load();
    const out = fn(db);
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    const tmp = `${FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db));
    await fs.rename(tmp, FILE);
    return out;
  });
  queue = run.catch(() => undefined);
  return run;
}
const fileRepo: Repo = {
  async getCartLines(id) {
    await queue;
    return (await load()).carts[id]?.lines ?? [];
  },
  setCartLines: (id, lines) => mutate((db) => void (db.carts[id] = { lines })),
  insertOrder: (o) =>
    mutate((db) => {
      const rec: OrderRec = { ...o, id: o.id ?? ++db.seq, createdAt: Date.now() };
      db.orders[rec.id] = rec;
      return rec;
    }),
  async getOrder(id) {
    await queue;
    return (await load()).orders[id] ?? null;
  },
  saveOrder: (o) => mutate((db) => void (db.orders[o.id] = o)),
  async listOrders() {
    await queue;
    return Object.values((await load()).orders).sort((a, b) => b.createdAt - a.createdAt);
  },
};

export const backendName = () => (client() ? "supabase" : "file");
const repo = (): Repo => {
  const c = client();
  if (c) return supabaseRepo(c);
  // На Vercel диск тимчасовий: без Supabase замовлення загубляться, краще впасти одразу
  if (process.env.VERCEL) throw new Error("Задайте NEXT_PUBLIC_SUPABASE_URL і SUPABASE_SECRET_KEY: на Vercel файлове сховище не працює");
  return fileRepo;
};

export const getCartLines = (id: string) => repo().getCartLines(id);
export const setCartLines = (id: string, l: CartLineRec[]) => repo().setCartLines(id, l);
export const insertOrder = (o: NewOrderRec) => repo().insertOrder(o);
export const getOrderRec = (id: number) => repo().getOrder(id);
export const saveOrder = (o: OrderRec) => repo().saveOrder(o);
export const listOrderRecs = () => repo().listOrders();
