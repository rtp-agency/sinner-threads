import Image from "next/image";
import Link from "@/components/loc-link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCatalog, getProduct } from "@/lib/mydrop";
import { money } from "@/lib/format";
import { BuyBox } from "@/components/buy-box";
import { isLang } from "@/i18n/config";
import { dict } from "@/i18n/dict";
import { tr } from "@/i18n/glossary";
import { alternates } from "@/lib/seo";
import { ProductCard } from "@/components/product-card";

export async function generateMetadata({ params }: PageProps<"/[lang]/product/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  if (!isLang(lang)) return {};
  const p = await getProduct(Number(id));
  if (!p) return {};
  const title = tr(p.title, lang);
  return { title, description: dict(lang).product.meta(title, money(p.price)), openGraph: { images: p.images.slice(0, 1) }, alternates: alternates(lang, `/product/${p.id}`) };
}

export default async function ProductPage({ params }: PageProps<"/[lang]/product/[id]">) {
  const { lang, id: rawId } = await params;
  if (!isLang(lang)) notFound();
  const d = dict(lang);
  const id = Number(rawId);
  const [p, { products, categories }] = await Promise.all([getProduct(id), getCatalog()]);
  if (!p) notFound();
  const cat = categories.find((c) => c.id === p.categoryId);
  const similar = products.filter((x) => x.categoryId === p.categoryId && x.id !== p.id && x.inStock).slice(0, 4);
  const title = tr(p.title, lang);
  const specs = [...p.params.map((x) => ({ title: tr(x.title, lang), value: tr(x.value, lang) })), ...(p.sku ? [{ title: d.product.sku, value: p.sku }] : [])];
  const chart = p.variants.filter((v) => v.params.length);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">
      <nav aria-label={d.product.nav} className="mb-6 font-mono text-xs uppercase tracking-widest text-mute">
        <Link href="/catalog" className="hover:underline">{d.product.catalog}</Link>
        {cat && <> / <Link href={`/catalog?cat=${cat.id}`} className="hover:underline">{tr(cat.title, lang)}</Link></>}
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div className={`-mx-4 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] md:mx-0 md:gap-3 lg:grid lg:overflow-visible ${p.images.length > 1 ? "lg:grid-cols-2" : ""}`}>
          {p.images.map((src, i) => (
            <div key={src} className={`relative aspect-[4/5] max-h-[58svh] w-full shrink-0 snap-center overflow-hidden bg-soft md:max-h-none md:w-[85%] lg:w-auto ${i === 0 && p.images.length > 1 ? "lg:col-span-2" : ""}`}>
              <Image src={src} alt={d.product.photo(title, i + 1)} fill priority={i === 0} sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <h1 className="font-display text-4xl md:text-5xl">{title}</h1>
          <p className="num mt-4 text-2xl">{money(p.price)}</p>
          <div className="stitch-t mt-6 pt-6"><BuyBox p={p} /></div>

          {p.description && <p className="stitch-t mt-8 whitespace-pre-line pt-6 text-sm leading-relaxed text-mute">{p.description}</p>}

          {specs.length > 0 && (
            <dl className="stitch-t mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 pt-6 text-sm">
              {specs.map((s) => (<div key={s.title} className="contents"><dt className="text-mute">{s.title}</dt><dd>{s.value}</dd></div>))}
            </dl>
          )}

          {chart.length > 0 && (
            <div className="stitch-t mt-8 pt-6">
              <h2 className="mb-3 font-mono text-xs uppercase tracking-widest">{d.product.measures}</h2>
              <ul className="space-y-1 text-sm">
                {chart.map((v) => (<li key={v.id}><span className="num mr-3">{tr(v.title, lang)}</span><span className="text-mute">{v.params.map((x) => `${tr(x.title, lang)}: ${x.value}`).join(", ")}</span></li>))}
              </ul>
            </div>
          )}
          {p.sizeChart && (
            <div className="stitch-t mt-8 pt-6">
              <h2 className="mb-3 font-mono text-xs uppercase tracking-widest">{d.product.sizeChart}</h2>
              <Image src={p.sizeChart} alt={d.product.sizeChart} width={700} height={500} className="h-auto w-full" />
            </div>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-24" aria-labelledby="sim">
          <h2 id="sim" className="font-display text-4xl">{d.product.similar}</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {similar.map((x) => <ProductCard key={x.id} p={x} lang={lang} />)}
          </div>
        </section>
      )}
    </div>
  );
}
