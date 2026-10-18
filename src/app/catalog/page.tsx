import Link from "next/link";
import type { Metadata } from "next";
import { getCatalog } from "@/lib/mydrop";
import { applyFilters, PAGE_SIZE, parseFilters, sizesFor, toHref, visibleCategories } from "@/lib/query";
import { ProductCard } from "@/components/product-card";

export const metadata: Metadata = { title: "Каталог" };

const SORTS = [
  { v: undefined, l: "Спочатку наявні" },
  { v: "price-asc", l: "Дешевші" },
  { v: "price-desc", l: "Дорожчі" },
];

export default async function Catalog({ searchParams }: PageProps<"/catalog">) {
  const f = parseFilters(await searchParams);
  const { products, categories } = await getCatalog();
  const cats = visibleCategories(categories);
  const topCats = cats.filter((c) => c.parentId === null);

  const base = applyFilters(products, categories, { ...f, size: undefined });
  const sizes = sizesFor(base);
  const list = applyFilters(products, categories, f);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const page = Math.min(f.page ?? 1, pages);
  const slice = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeCat = cats.find((c) => c.id === f.cat);

  const chip = (active: boolean) =>
    `inline-flex min-h-11 shrink-0 items-center whitespace-nowrap border px-3 font-mono text-xs uppercase tracking-widest ${active ? "border-ink bg-ink text-paper" : "border-ink hover:bg-ink hover:text-paper"}`;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-5xl md:text-6xl">{activeCat?.title ?? "Каталог"}</h1>
        <p className="num text-sm text-mute">{list.length} товарів</p>
      </div>

      <div className="stitch-t stitch-b mt-8 space-y-4 py-5">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0" role="group" aria-label="Категорії">
          <Link href={toHref(f, { cat: undefined })} className={chip(!f.cat)}>Усе</Link>
          {topCats.map((c) => (
            <Link key={c.id} href={toHref(f, { cat: c.id })} className={chip(f.cat === c.id)}>{c.title}</Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0" role="group" aria-label="Розмір">
            <span className="mr-1 font-mono text-xs uppercase tracking-widest text-mute">Розмір</span>
            {sizes.slice(0, 12).map((s) => (
              <Link key={s} href={toHref(f, { size: f.size === s ? undefined : s })} className={chip(f.size === s)}>{s}</Link>
            ))}
          </div>
          <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:contents">
            <Link href={toHref(f, { stock: !f.stock })} className={chip(!!f.stock)} aria-pressed={!!f.stock}>Тільки в наявності</Link>
            <div className="flex items-center gap-2 md:ml-auto" role="group" aria-label="Сортування">
              {SORTS.map((s) => (
                <Link key={s.l} href={toHref(f, { sort: s.v })} className={chip((f.sort ?? undefined) === s.v)}>{s.l}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {slice.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-display text-3xl">Нічого не знайшли</p>
          <p className="mt-3 text-mute">Спробуйте інший розмір або зніміть фільтри.</p>
          <Link href="/catalog" className="btn mt-8">Скинути фільтри</Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {slice.map((p, i) => <ProductCard key={p.id} p={p} priority={i < 4} />)}
        </div>
      )}

      {pages > 1 && (
        <nav className="mt-14 flex flex-wrap justify-center gap-2" aria-label="Сторінки">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link key={n} href={toHref(f, { page: n })} aria-current={n === page ? "page" : undefined} className={`num ${chip(n === page)}`}>{n}</Link>
          ))}
        </nav>
      )}
    </div>
  );
}
