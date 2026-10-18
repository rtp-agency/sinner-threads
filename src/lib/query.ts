import type { Category, Product } from "./types";

export type Filters = { cat?: number; size?: string; stock?: boolean; sort?: string; q?: string; page?: number };

export const PAGE_SIZE = 24;

export function categoryIds(cats: Category[], id: number): Set<number> {
  const ids = new Set<number>([id]);
  for (const c of cats) if (c.parentId === id) ids.add(c.id);
  return ids;
}

/** Категорії з урахуванням дочірніх; порожні прибираємо */
export function visibleCategories(cats: Category[]) {
  return cats
    .map((c) => ({ ...c, total: c.count + cats.filter((x) => x.parentId === c.id).reduce((s, x) => s + x.count, 0) }))
    .filter((c) => c.total > 0);
}

export function applyFilters(products: Product[], cats: Category[], f: Filters) {
  let list = products;
  if (f.cat) {
    const ids = categoryIds(cats, f.cat);
    list = list.filter((p) => p.categoryId !== null && ids.has(p.categoryId));
  }
  if (f.stock) list = list.filter((p) => p.inStock);
  if (f.size) list = list.filter((p) => p.variants.some((v) => v.stock > 0 && v.title === f.size));
  if (f.q) {
    const q = f.q.toLowerCase();
    list = list.filter((p) => p.title.toLowerCase().includes(q));
  }
  const sorted = [...list];
  if (f.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (f.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  else sorted.sort((a, b) => Number(b.inStock) - Number(a.inStock) || b.id - a.id); // наявні вище, нові вище
  return sorted;
}

export function sizesFor(products: Product[]) {
  const order = ["XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL"];
  const set = new Set<string>();
  for (const p of products) for (const v of p.variants) if (v.stock > 0 && v.title !== "-") set.add(v.title);
  return [...set].sort((a, b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    if (ia >= 0 && ib >= 0) return ia - ib;
    if (ia >= 0) return -1;
    if (ib >= 0) return 1;
    return a.localeCompare(b, "uk", { numeric: true });
  });
}

export function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const cat = Number(one("cat"));
  const page = Number(one("page"));
  return {
    cat: Number.isFinite(cat) && cat > 0 ? cat : undefined,
    size: one("size") || undefined,
    stock: one("stock") === "1",
    sort: one("sort") || undefined,
    q: one("q")?.trim().slice(0, 60) || undefined,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function toHref(f: Filters, patch: Partial<Filters>) {
  const n = { ...f, ...patch };
  if ("cat" in patch || "size" in patch || "stock" in patch || "q" in patch || "sort" in patch) n.page = 1;
  const p = new URLSearchParams();
  if (n.cat) p.set("cat", String(n.cat));
  if (n.size) p.set("size", n.size);
  if (n.stock) p.set("stock", "1");
  if (n.sort) p.set("sort", n.sort);
  if (n.q) p.set("q", n.q);
  if (n.page && n.page > 1) p.set("page", String(n.page));
  const s = p.toString();
  return s ? `/catalog?${s}` : "/catalog";
}
