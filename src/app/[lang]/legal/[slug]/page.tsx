import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LOCALES, isLang } from "@/i18n/config";
import { dict } from "@/i18n/dict";
import { alternates } from "@/lib/seo";

// ЗАГЛУШКИ. Тексти додаються після реєстрації ФОП і погодження з юристом.
const SLUGS = ["offer", "privacy", "returns", "delivery"] as const;
type Slug = (typeof SLUGS)[number];
const isSlug = (s: string): s is Slug => (SLUGS as readonly string[]).includes(s);

export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALES.flatMap((lang) => SLUGS.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/legal/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang) || !isSlug(slug)) return {};
  return { title: dict(lang).legal.docs[slug].title, alternates: alternates(lang, `/legal/${slug}`) };
}

export default async function Legal({ params }: PageProps<"/[lang]/legal/[slug]">) {
  const { lang, slug } = await params;
  if (!isLang(lang) || !isSlug(slug)) notFound();
  const d = dict(lang);
  const doc = d.legal.docs[slug];
  const L = d.footer.legal;
  return (
    <article className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="font-display text-5xl">{doc.title}</h1>
      <p className="mt-4 text-mute">{doc.intro}</p>
      <p className="stitch mt-8 p-4 text-sm">{d.legal.placeholder}</p>
      <ol className="mt-8 list-decimal space-y-3 pl-5">
        {doc.sections.map((s) => (<li key={s}>{s}</li>))}
      </ol>
      <p className="stitch-t mt-12 pt-6 text-sm text-mute">{L.entity}, {L.code}, {L.address}</p>
    </article>
  );
}
