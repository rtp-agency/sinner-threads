import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package, CreditCard, Ruler, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { getCatalog } from "@/lib/mydrop";
import { visibleCategories } from "@/lib/query";
import { ProductCard } from "@/components/product-card";
import { Thread } from "@/components/thread";
import { CategoryCoverFlow } from "@/components/category-coverflow";
import { LogoMarquee } from "@/components/logo-marquee";

export default async function Home() {
  const { products, categories } = await getCatalog();
  const inStock = products.filter((p) => p.inStock);
  const heroPicks = inStock.slice(0, 2);
  const cats = visibleCategories(categories)
    .filter((c) => c.parentId === null)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)
    .map((c) => {
      const cover = inStock.find((p) => p.categoryId === c.id || categories.find((x) => x.id === p.categoryId)?.parentId === c.id);
      return cover ? { id: c.id, title: c.title, count: c.total, image: cover.images[0] } : null;
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);
  const fresh = inStock.slice(2, 10);

  return (
    <>
      <section className="relative overflow-hidden solid-b">
        <Thread className="pointer-events-none absolute inset-0 h-full w-full text-ink opacity-20 md:opacity-40" />
        <div className="relative mx-auto grid min-h-[calc(100dvh-8rem)] max-w-[1400px] items-center gap-10 px-4 py-12 md:grid-cols-[1.1fr_1fr] md:px-8 lg:py-16">
          <div className="max-w-xl">
            <h1 className="rise font-display text-6xl md:text-7xl lg:text-8xl">
              Брендовий одяг та аксесуари
            </h1>
            <p className="rise rise-2 mt-6 max-w-[48ch] text-base leading-relaxed text-mute">
              Худі, пуховики, джинси, сумки. Показуємо лише те, що є в наявності, з реальними розмірами. Відправка Новою поштою.
            </p>
            <div className="rise rise-3 mt-8 flex flex-wrap gap-3">
              <Link href="/catalog" className="btn">Дивитись каталог <ArrowRight size={16} /></Link>
              <Link href="/catalog?stock=1" className="btn btn-ghost">В наявності</Link>
            </div>
          </div>
          <div className="rise rise-2 grid grid-cols-2 items-end gap-4">
            {heroPicks.map((p, i) => (
              <Link key={p.id} href={`/product/${p.id}`} className={`group block ${i === 1 ? "mb-10" : "mt-10"}`}>
                <div className="relative aspect-[3/4] overflow-hidden bg-soft">
                  <Image src={p.images[0]} alt={p.title} fill priority sizes="(min-width:768px) 22vw, 45vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
                </div>
                <p className="stitch-t mt-3 pt-2 text-sm group-hover:underline underline-offset-4">{p.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mt-20 overflow-hidden py-14" aria-labelledby="cats">
        <LogoMarquee />
        <div className="relative z-10 mx-auto max-w-[1400px] px-4 md:px-8">
        <h2 id="cats" className="font-display text-4xl md:text-5xl">Що у нас є</h2>
        <div className="mt-6"><CategoryCoverFlow items={cats} /></div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 pt-24 md:px-8" aria-labelledby="fresh">
        <div className="flex items-end justify-between gap-6">
          <h2 id="fresh" className="font-display text-4xl md:text-5xl">Вже в наявності</h2>
          <Link href="/catalog?stock=1" className="font-mono text-xs uppercase tracking-widest underline underline-offset-8">Весь каталог</Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {fresh.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-[1400px] px-4 md:px-8" aria-labelledby="how">
        <h2 id="how" className="sr-only">Як ми працюємо</h2>
        <ul className="stitch-t stitch-b grid divide-y divide-dashed divide-line md:grid-cols-4 md:divide-x md:divide-y-0">
          {[
            { I: Ruler, t: "Розмір на вибір", d: "Наявність кожного розміру видно на сторінці товару." },
            { I: CreditCard, t: "Оплата", d: "Карткою онлайн або накладеним платежем при отриманні." },
            { I: Package, t: "Нова пошта", d: "Відправляємо по всій Україні, ТТН надсилаємо в повідомленні." },
            { I: ShieldCheck, t: "Обмін і повернення", d: "Умови повернення описані в публічній оферті." },
          ].map(({ I, t, d }) => (
            <li key={t} className="px-0 py-6 md:px-6 md:first:pl-0 md:last:pr-0">
              <I size={26} />
              <p className="mt-4 text-sm font-semibold">{t}</p>
              <p className="mt-2 max-w-[32ch] text-sm text-mute">{d}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
