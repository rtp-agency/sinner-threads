import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/loc-link";
import { getOrder } from "@/lib/orders";
import { money } from "@/lib/format";
import { validOrderToken } from "@/lib/security";
import { isLang } from "@/i18n/config";
import { dict } from "@/i18n/dict";
import { tr } from "@/i18n/glossary";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[lang]/order/[id]">): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? { title: dict(lang).order.meta, robots: { index: false } } : {};
}

export default async function OrderDone({ params, searchParams }: PageProps<"/[lang]/order/[id]">) {
  const { lang, id: rawId } = await params;
  if (!isLang(lang)) notFound();
  const d = dict(lang).order;
  const id = Number(rawId);
  const t = (await searchParams).t;
  // Без дійсного токена деталі (імʼя, телефон, адреса) не показуємо
  const o = validOrderToken(id, typeof t === "string" ? t : undefined) ? await getOrder(id) : null;

  const head = !o
    ? { t: d.unknownT(id), d: d.unknownD }
    : o.status === "payment_failed"
      ? { t: d.failedT, d: d.failedD }
      : o.status === "awaiting_payment"
        ? { t: d.waitT, d: d.waitD }
        : o.payment === "cod"
          ? { t: d.codT, d: d.codD }
          : { t: d.paidT, d: d.paidD };

  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <p className="num text-sm text-mute">{d.no(id)}</p>
      <h1 className="mt-3 font-display text-5xl">{head.t}</h1>
      <p className="mt-5 leading-relaxed text-mute">{head.d}</p>
      {o && (
        <div className="stitch mt-8 p-5">
          <ul className="space-y-2 text-sm">
            {o.lines.map((l) => (
              <li key={l.variantId} className="flex justify-between gap-4">
                <span>{tr(l.title, lang)}, {tr(l.size, lang)} <span className="num text-mute">x{l.qty}</span></span>
                <span className="num shrink-0">{money(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <p className="stitch-t num mt-4 flex justify-between pt-3"><span className="font-sans text-sm">{d.total}</span>{money(o.total)}</p>
          <p className="mt-4 text-sm text-mute">{d.branch(o.customer.city, o.customer.warehouse)} {o.payment === "cod" ? d.codNote : d.paidNote}</p>
        </div>
      )}
      <Link href={o?.status === "payment_failed" ? "/cart" : "/catalog"} className="btn mt-10">{o?.status === "payment_failed" ? d.backCart : d.keep}</Link>
    </div>
  );
}
