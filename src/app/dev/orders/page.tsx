import { notFound } from "next/navigation";
import { listOrders } from "@/lib/orders";
import { money } from "@/lib/format";
import { demoEnabled } from "@/lib/payments";

export const dynamic = "force-dynamic";
export const metadata = { title: "Замовлення (dev)", robots: { index: false } };

const LABEL = { awaiting_payment: "Очікує оплату", paid: "Оплачено", payment_failed: "Оплата не пройшла", placed: "Прийнято" } as const;

/** Службова сторінка для розробки: перелік локальних замовлень. У production недоступна. */
export default async function DevOrders() {
  if (!demoEnabled()) notFound();
  const orders = await listOrders();
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-5xl">Замовлення (dev)</h1>
      {orders.length === 0 && <p className="mt-6 text-mute">Поки порожньо. Оформіть замовлення на сайті.</p>}
      <ul className="mt-8 divide-y divide-dashed divide-line">
        {orders.map((o) => (
          <li key={o.id} className="py-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="num">№{o.id} <span className="text-mute">({o.mode})</span></p>
              <p className="font-mono text-xs uppercase tracking-widest">{LABEL[o.status]}</p>
              <p className="num">{money(o.total)}</p>
            </div>
            <p className="mt-2 text-sm">{o.customer.name}, {o.customer.phone}, {o.customer.city}, відд. {o.customer.warehouse}</p>
            <p className="mt-1 text-sm text-mute">{o.lines.map((l) => `${l.title} ${l.size} x${l.qty}`).join("; ")}</p>
            <p className="mt-1 font-mono text-[11px] text-mute">{o.history.map((h) => `${new Date(h.at).toLocaleTimeString("uk-UA")} ${h.event}`).join(" > ")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
