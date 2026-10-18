import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// ---------- Доступ до сторінки замовлення ----------
// Номери замовлень послідовні, тому самого номера мало: без токена будь-хто міг би перебрати /order/1001, 1002...
// Токен рахується як HMAC від номера (нічого додатково зберігати не треба) і додається в посилання.
function secret(): string {
  const s = process.env.ORDER_TOKEN_SECRET ?? process.env.SUPABASE_SECRET_KEY;
  if (s) return s;
  if (process.env.NODE_ENV !== "production") return "dev-only-secret";
  throw new Error("Задайте ORDER_TOKEN_SECRET (або SUPABASE_SECRET_KEY)");
}
export const orderToken = (id: number) => createHmac("sha256", secret()).update(`order:${id}`).digest("hex").slice(0, 24);

const eq = (a: string, b: string) => {
  const x = createHmac("sha256", "cmp").update(a).digest();
  const y = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(x, y);
};
export const validOrderToken = (id: number, t: string | undefined) => !!t && eq(t, orderToken(id));
export const orderPath = (id: number) => `/order/${id}?t=${orderToken(id)}`;

/** Службові сторінки (/dev/orders): ключ ADMIN_KEY; без нього на проді сторінка недоступна, локально відкрита. */
export function adminOk(key: string | undefined): boolean {
  const k = process.env.ADMIN_KEY;
  if (!k) return process.env.NODE_ENV !== "production";
  return !!key && eq(key, k);
}

// ---------- Обмеження частоти (в памʼяті інстансу) ----------
// Це базовий захист від підбору і спаму. Між інстансами Vercel лічильники не діляться,
// для жорсткого ліміту потрібен Redis/Upstash або WAF Vercel.
const hits = new Map<string, number[]>();
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) for (const [k, v] of hits) if (now - v[v.length - 1] > windowMs) hits.delete(k);
  return arr.length <= max;
}
export const clientIp = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";

// ---------- CSRF ----------
/** Для POST/PATCH/DELETE: Origin має збігатися з нашим хостом. Без Origin дозволяємо лише поза продом (curl, тести). */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  try {
    return new URL(origin).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host"));
  } catch {
    return false;
  }
}

/** Прибирає керуючі символи і кутові дужки, обрізає довжину. */
export const clean = (s: unknown, max: number) =>
  String(s ?? "").replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
