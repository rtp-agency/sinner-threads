import "server-only";
import { cache } from "react";
import type { Category, Product, Variant } from "./types";

const BASE = "https://backend.mydrop.com.ua/dropshipper/api";
const REVALIDATE = 900; // каталог у МійДроп і так кешується ~15 хв

function key() {
  const k = process.env.MYDROP_API_KEY;
  if (!k) throw new Error("MYDROP_API_KEY не задано");
  return k;
}

async function api<T>(path: string, init?: RequestInit & { next?: { revalidate?: number } }): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "X-API-KEY": key(), "Content-Type": "application/json", ...init?.headers },
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    /* не JSON */
  }
  if (!res.ok) {
    const b = body as { code?: string; message?: string } | null;
    throw new MyDropError(res.status, b?.code ?? "http_error", b?.message ?? text.slice(0, 200));
  }
  return body as T;
}

export class MyDropError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(`MyDrop ${status} ${code}: ${message}`);
  }
}

async function vendorLinkId(): Promise<number> {
  const fixed = process.env.MYDROP_VENDOR_LINK_ID;
  if (fixed) return Number(fixed);
  const r = await api<{ results: { id: number; verified: boolean }[] }>("/dropshipper_vendors", {
    next: { revalidate: 3600 },
  });
  const v = r.results.find((x) => x.verified);
  if (!v) throw new Error("Немає підтвердженого постачальника в МійДроп");
  return v.id;
}

type RawImage = { full_url: string };
type RawSize = {
  id: number;
  title: string;
  note: string | null;
  real_count_dropshipper: number | null;
  params?: { title: string; value: string }[];
  images?: RawImage[];
};
type RawProduct = {
  id: number;
  title: string;
  sku: string | null;
  category_id: number | null;
  description: string | null;
  drop_price: number;
  price: number | null;
  is_set?: boolean;
  sizes: RawSize[];
  images: RawImage[];
  params?: { title: string; value: string; unit?: string | null }[];
  size_chart_image: RawImage | null;
};
type RawCatalog = {
  categories: { id: number; title: string; parent_id: number | null }[];
  products: RawProduct[];
};

const MARKUP = Number(process.env.RETAIL_MARKUP ?? 1.35);
// Додаткова націнка магазину поверх роздрібної ціни (1.15 = +15%), округлення вгору до 10 грн
const UPLIFT = Number(process.env.PRICE_UPLIFT ?? 1.15);

function retail(p: RawProduct): number {
  // Беремо рекомендовану ціну постачальника; якщо її немає або вона нижча за дроп, ставимо націнку
  const base = p.price && p.price > p.drop_price ? p.price : p.drop_price * MARKUP;
  return Math.ceil((base * UPLIFT) / 10) * 10;
}

function normalize(p: RawProduct): Product {
  const variants: Variant[] = p.sizes.map((s) => ({
    id: s.id,
    title: s.title.trim(),
    stock: Math.max(0, s.real_count_dropshipper ?? 0),
    note: s.note,
    params: s.params?.map(({ title, value }) => ({ title, value })) ?? [],
    images: s.images?.map((i) => i.full_url) ?? [],
  }));
  return {
    id: p.id,
    title: p.title.trim().replace(/\s+/g, " "),
    sku: p.sku,
    categoryId: p.category_id,
    description: p.description?.trim() || null,
    price: retail(p),
    dropPrice: p.drop_price,
    images: p.images.map((i) => i.full_url),
    variants,
    inStock: variants.some((v) => v.stock > 0),
    params: p.params?.map((x) => ({ title: x.title, value: x.unit ? `${x.value} ${x.unit}` : x.value })) ?? [],
    sizeChart: p.size_chart_image?.full_url ?? null,
    isSet: !!p.is_set,
  };
}

export const getCatalog = cache(async (): Promise<{ products: Product[]; categories: Category[] }> => {
  const id = await vendorLinkId();
  const raw = await api<RawCatalog>(`/export/dropshipper_vendors/${id}/products/json`, {
    next: { revalidate: REVALIDATE },
  });
  // Комплекти та техпозиції (пакування) в вітрину не виводимо: у них особливий склад і ціноутворення
  const products = raw.products
    .filter((p) => !p.is_set && p.category_id !== null)
    .map(normalize)
    .filter((p) => p.images.length > 0 && !/пакуван/i.test(p.title));

  const counts = new Map<number, number>();
  for (const p of products) counts.set(p.categoryId!, (counts.get(p.categoryId!) ?? 0) + 1);
  const categories: Category[] = raw.categories
    .filter((c) => !/пакуван/i.test(c.title))
    .map((c) => ({ id: c.id, title: c.title.trim(), parentId: c.parent_id, count: counts.get(c.id) ?? 0 }));
  return { products, categories };
});

export async function getProduct(id: number) {
  const { products } = await getCatalog();
  return products.find((p) => p.id === id) ?? null;
}

/** Ціни рахуємо тільки на сервері, з каталогу. Клієнту не довіряємо. */
export type OrderInput = {
  name: string;
  phone: string;
  city: string;
  warehouse: string;
  comment?: string;
  prepaid: boolean;
  lines: { productId: number; variantId: number; qty: number; price: number }[];
};

export async function createDraftOrder(o: OrderInput) {
  const total = o.lines.reduce((s, l) => s + l.price * l.qty, 0);
  return api<{ id: number }>("/orders", {
    method: "POST",
    body: JSON.stringify({
      name: o.name,
      phone: o.phone,
      delivery_service: "nova_poshta",
      city: o.city,
      warehouse_number: o.warehouse,
      description: o.comment || undefined,
      private_description: o.prepaid ? "Оплата карткою на сайті" : "Накладений платіж",
      order_source: undefined,
      full_prepay_amount: o.prepaid || undefined,
      delivery_payment: o.prepaid ? undefined : total,
      products: o.lines.map((l) => ({
        product_id: l.productId,
        size_id: l.variantId,
        price: l.price,
        amount: l.qty,
      })),
    }),
  });
}

export async function submitOrder(orderId: number, extra: Record<string, unknown> = {}) {
  return api<unknown>(`/orders/${orderId}/submit`, {
    method: "POST",
    body: JSON.stringify(extra),
  });
}

export async function markOrder(orderId: number, patch: Record<string, unknown>) {
  return api<unknown>(`/orders/${orderId}`, { method: "PUT", body: JSON.stringify(patch) });
}
