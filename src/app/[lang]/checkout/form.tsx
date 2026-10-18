"use client";
import Link from "@/components/loc-link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart";
import { money } from "@/lib/format";
import { useLang, useT } from "@/i18n/context";
import { href } from "@/i18n/config";
import { tr } from "@/i18n/glossary";

type Err = { message: string; field?: string };
type FieldProps = { name: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>;

function TextField({ name, label, err, ...rest }: FieldProps & { err?: string }) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block font-mono text-xs uppercase tracking-widest">{label}</label>
      <input id={name} name={name} className="field" aria-invalid={err ? true : undefined} aria-describedby={err ? `${name}-e` : undefined} {...rest} />
      {err && <p id={`${name}-e`} className="mt-2 text-sm text-danger">{err}</p>}
    </div>
  );
}

export function CheckoutForm({ cardEnabled, demo }: { cardEnabled: boolean; demo: boolean }) {
  const { lines, total, ready, refresh } = useCart();
  const t = useT();
  const lang = useLang();
  const router = useRouter();
  const [payment, setPayment] = useState<"cod" | "card">("cod");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<Err | null>(null);
  const payForm = useRef<HTMLFormElement>(null);
  const [pay, setPay] = useState<{ url: string; method: "POST" | "GET"; fields: Record<string, string> } | null>(null);

  // Форма оплати з'являється після setPay; відправляємо її, коли вона вже в DOM
  useEffect(() => {
    if (pay) payForm.current?.submit();
  }, [pay]);

  if (!ready) return <div className="mx-auto max-w-3xl px-4 py-12"><div className="skeleton h-64" aria-busy /></div>;
  if (lines.length === 0 && !pay) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-5xl">{t.cart.emptyT}</h1>
        <Link href="/catalog" className="btn mt-8">{t.cart.toCatalog}</Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"), phone: f.get("phone"), city: f.get("city"), warehouse: f.get("warehouse"),
          comment: f.get("comment"), accept: f.get("accept") === "on", payment, lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErr({ message: data.message ?? t.checkout.err, field: data.field }); setBusy(false); return; }
      if (data.pay) {
        setPay(data.pay);
        void refresh();
        return;
      }
      void refresh();
      router.push(href(lang, data.path));
    } catch {
      setErr({ message: t.checkout.noNet });
      setBusy(false);
    }
  }

  const bad = (n: string) => err?.field === n;
  const errFor = (n: string) => (err?.field === n ? err.message : undefined);

  return (
    <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-10 md:px-8 lg:grid-cols-[1.4fr_1fr]">
      <form onSubmit={onSubmit} noValidate className="space-y-8">
        <h1 className="font-display text-5xl">{t.checkout.title}</h1>
        {demo && <p role="note" className="stitch p-3 font-mono text-xs uppercase tracking-widest">{t.checkout.demo}</p>}

        <section className="space-y-5">
          <h2 className="mb-4 text-sm font-semibold">{t.checkout.contacts}</h2>
          <TextField err={errFor("name")} name="name" label={t.checkout.name} autoComplete="name" required />
          <TextField err={errFor("phone")} name="phone" label={t.checkout.phone} type="tel" inputMode="tel" autoComplete="tel" placeholder="+380" required />
        </section>

        <section className="stitch-t space-y-5 pt-8">
          <h2 className="mb-4 text-sm font-semibold">{t.checkout.np}</h2>
          <TextField err={errFor("city")} name="city" label={t.checkout.city} autoComplete="address-level2" required />
          <TextField err={errFor("warehouse")} name="warehouse" label={t.checkout.warehouse} inputMode="numeric" required />
          <div>
            <label htmlFor="comment" className="mb-2 block font-mono text-xs uppercase tracking-widest">{t.checkout.comment}</label>
            <textarea id="comment" name="comment" rows={3} maxLength={300} className="field" />
          </div>
        </section>

        <section className="stitch-t pt-8">
          <h2 className="mb-4 text-sm font-semibold">{t.checkout.payment}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              { v: "cod", t: t.checkout.cod, d: t.checkout.codD, off: false },
              { v: "card", t: t.checkout.card, d: cardEnabled ? t.checkout.cardD : t.checkout.cardSoon, off: !cardEnabled },
            ] as const).map((o) => (
              <label key={o.v} className={`block cursor-pointer border p-4 ${payment === o.v ? "border-ink bg-soft" : "border-dashed"} ${o.off ? "cursor-not-allowed opacity-50" : ""}`}>
                <input type="radio" name="payment" value={o.v} checked={payment === o.v} disabled={o.off} onChange={() => setPayment(o.v)} className="sr-only" />
                <span className="block text-sm font-semibold">{o.t}</span>
                <span className="mt-1 block text-sm text-mute">{o.d}</span>
              </label>
            ))}
          </div>
        </section>

        <div className="stitch-t space-y-4 pt-8">
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="accept" className="mt-1 size-4 accent-[var(--ink)]" aria-invalid={bad("accept") || undefined} />
            <span>{t.checkout.agree1} <Link href="/legal/offer" className="underline" target="_blank">{t.checkout.offer}</Link> {t.checkout.and} <Link href="/legal/privacy" className="underline" target="_blank">{t.checkout.privacy}</Link></span>
          </label>
          {bad("accept") && <p className="text-sm text-danger">{err!.message}</p>}
          {err && !err.field && <p role="alert" className="stitch p-4 text-sm text-danger">{err.message}</p>}
          <button className="btn w-full sm:w-auto" disabled={busy}>{busy ? t.checkout.busy : payment === "card" ? t.checkout.pay : t.checkout.submit}</button>
        </div>
      </form>

      <aside className="stitch h-fit p-6 lg:sticky lg:top-24">
        <h2 className="font-mono text-xs uppercase tracking-widest">{t.checkout.yourOrder}</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {lines.map((l) => (
            <li key={l.variantId} className="flex justify-between gap-4">
              <span>{tr(l.title, lang)}, {tr(l.size, lang)} <span className="num text-mute">x{l.qty}</span></span>
              <span className="num shrink-0">{money(l.price * l.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="stitch-t num mt-5 flex justify-between pt-4 text-lg"><span className="font-sans text-sm">{t.checkout.total}</span>{money(total)}</p>
      </aside>

      {pay && (
        <form ref={payForm} action={href(lang, pay.url)} method={pay.method} className="hidden">
          {Object.entries(pay.fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        </form>
      )}
    </div>
  );
}
