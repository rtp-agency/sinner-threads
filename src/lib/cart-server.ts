import "server-only";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { getProduct } from "./mydrop";
import { getCartLines, setCartLines, type CartLineRec } from "./store";

const COOKIE = "st_cart";
const MAX_LINES = 30;

export type CartLineView = {
  productId: number;
  variantId: number;
  title: string;
  size: string;
  price: number;
  image: string;
  max: number;
  qty: number;
};
export type CartView = { lines: CartLineView[]; count: number; total: number; notices: string[] };

async function cartId(create: boolean): Promise<string | null> {
  const jar = await cookies();
  const cur = jar.get(COOKIE)?.value;
  if (cur && /^[0-9a-f-]{36}$/.test(cur)) return cur;
  if (!create) return null;
  const id = randomUUID();
  jar.set(COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30, secure: process.env.NODE_ENV === "production" });
  return id;
}

/** Збирає кошик із актуального каталогу: ціни і залишки завжди свіжі, зниклі позиції прибираються. */
export async function hydrate(recs: CartLineRec[]): Promise<{ view: CartView; clean: CartLineRec[] }> {
  const lines: CartLineView[] = [];
  const clean: CartLineRec[] = [];
  const notices: string[] = [];
  for (const r of recs) {
    const p = await getProduct(r.productId);
    const v = p?.variants.find((x) => x.id === r.variantId);
    if (!p || !v || v.stock <= 0) {
      notices.push(`${p?.title ?? "Товар"} більше недоступний і прибраний з кошика`);
      continue;
    }
    const qty = Math.min(r.qty, v.stock);
    if (qty < r.qty) notices.push(`${p.title}, ${v.title}: залишилось ${v.stock} шт.`);
    lines.push({ productId: p.id, variantId: v.id, title: p.title, size: v.title, price: p.price, image: p.images[0], max: v.stock, qty });
    clean.push({ productId: p.id, variantId: v.id, qty });
  }
  return {
    view: { lines, count: lines.reduce((s, l) => s + l.qty, 0), total: lines.reduce((s, l) => s + l.qty * l.price, 0), notices },
    clean,
  };
}

export async function getCart(): Promise<CartView> {
  const id = await cartId(false);
  const recs = id ? await getCartLines(id) : [];
  const { view, clean } = await hydrate(recs);
  if (id && clean.length !== recs.length) await saveLines(id, clean);
  return view;
}

const saveLines = setCartLines;

export async function mutateCart(fn: (lines: CartLineRec[]) => CartLineRec[]): Promise<CartView> {
  const id = (await cartId(true))!;
  const cur = await getCartLines(id);
  const { view, clean } = await hydrate(fn(structuredClone(cur)).slice(0, MAX_LINES));
  await saveLines(id, clean);
  return view;
}

export async function clearCartRecord() {
  const id = await cartId(false);
  if (id) await saveLines(id, []);
}

export async function rawCartLines(): Promise<CartLineRec[]> {
  const id = await cartId(false);
  return id ? getCartLines(id) : [];
}
