"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart";
import { money } from "@/lib/format";

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

export function CheckoutForm({ cardEnabled }: { cardEnabled: boolean }) {
  const { lines, total, ready, refresh } = useCart();
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
        <h1 className="font-display text-5xl">Кошик порожній</h1>
        <Link href="/catalog" className="btn mt-8">До каталогу</Link>
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
          comment: f.get("comment"), accept: f.get("accept") === "on", payment,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErr({ message: data.message ?? "Помилка", field: data.field }); setBusy(false); return; }
      if (data.pay) {
        setPay(data.pay);
        void refresh();
        return;
      }
      void refresh();
      router.push(`/order/${data.orderId}`);
    } catch {
      setErr({ message: "Немає зв’язку з сервером. Перевірте інтернет і спробуйте ще раз." });
      setBusy(false);
    }
  }

  const bad = (n: string) => err?.field === n;
  const errFor = (n: string) => (err?.field === n ? err.message : undefined);

  return (
    <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-10 md:px-8 lg:grid-cols-[1.4fr_1fr]">
      <form onSubmit={onSubmit} noValidate className="space-y-8">
        <h1 className="font-display text-5xl">Оформлення</h1>

        <section className="space-y-5">
          <h2 className="mb-4 text-sm font-semibold">Контакти</h2>
          <TextField err={errFor("name")} name="name" label="Ім’я та прізвище" autoComplete="name" required />
          <TextField err={errFor("phone")} name="phone" label="Телефон" type="tel" inputMode="tel" autoComplete="tel" placeholder="+380" required />
        </section>

        <section className="stitch-t space-y-5 pt-8">
          <h2 className="mb-4 text-sm font-semibold">Нова пошта</h2>
          <TextField err={errFor("city")} name="city" label="Місто" autoComplete="address-level2" required />
          <TextField err={errFor("warehouse")} name="warehouse" label="Номер відділення або поштомату" inputMode="numeric" required />
          <div>
            <label htmlFor="comment" className="mb-2 block font-mono text-xs uppercase tracking-widest">Коментар (необов’язково)</label>
            <textarea id="comment" name="comment" rows={3} maxLength={300} className="field" />
          </div>
        </section>

        <section className="stitch-t pt-8">
          <h2 className="mb-4 text-sm font-semibold">Оплата</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              { v: "cod", t: "При отриманні", d: "Накладений платіж у відділенні Нової пошти.", off: false },
              { v: "card", t: "Карткою онлайн", d: cardEnabled ? "Visa / Mastercard, Apple Pay, Google Pay." : "Скоро. Підключаємо платіжну систему.", off: !cardEnabled },
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
            <span>Погоджуюсь з <Link href="/legal/offer" className="underline" target="_blank">публічною офертою</Link> та <Link href="/legal/privacy" className="underline" target="_blank">політикою конфіденційності</Link></span>
          </label>
          {bad("accept") && <p className="text-sm text-danger">{err!.message}</p>}
          {err && !err.field && <p role="alert" className="stitch p-4 text-sm text-danger">{err.message}</p>}
          <button className="btn w-full sm:w-auto" disabled={busy}>{busy ? "Оформлюємо..." : payment === "card" ? "Перейти до оплати" : "Підтвердити замовлення"}</button>
        </div>
      </form>

      <aside className="stitch h-fit p-6 lg:sticky lg:top-24">
        <h2 className="font-mono text-xs uppercase tracking-widest">Ваше замовлення</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {lines.map((l) => (
            <li key={l.variantId} className="flex justify-between gap-4">
              <span>{l.title}, {l.size} <span className="num text-mute">x{l.qty}</span></span>
              <span className="num shrink-0">{money(l.price * l.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="stitch-t num mt-5 flex justify-between pt-4 text-lg"><span className="font-sans text-sm">Разом</span>{money(total)}</p>
      </aside>

      {pay && (
        <form ref={payForm} action={pay.url} method={pay.method} className="hidden">
          {Object.entries(pay.fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        </form>
      )}
    </div>
  );
}
