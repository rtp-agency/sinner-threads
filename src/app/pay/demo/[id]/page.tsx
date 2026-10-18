import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getOrder, settlePayment } from "@/lib/orders";
import { demoEnabled } from "@/lib/payments";
import { orderPath, validOrderToken } from "@/lib/security";
import { money } from "@/lib/format";

export const metadata: Metadata = { title: "Тестова оплата", robots: { index: false } };
export const dynamic = "force-dynamic";

async function decide(formData: FormData) {
  "use server";
  if (!demoEnabled()) return;
  const id = Number(formData.get("id"));
  if (!validOrderToken(id, String(formData.get("t") ?? ""))) return;
  const paid = formData.get("outcome") === "paid";
  await settlePayment(id, paid);
  redirect(orderPath(id));
}

export default async function DemoPay({ params, searchParams }: PageProps<"/pay/demo/[id]">) {
  if (!demoEnabled()) notFound();
  const id = Number((await params).id);
  const t = String((await searchParams).t ?? "");
  if (!validOrderToken(id, t)) notFound();
  const o = await getOrder(id);
  if (!o || o.payment !== "card") notFound();

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <p className="stitch p-3 text-center font-mono text-xs uppercase tracking-widest">Тестова оплата, гроші не списуються</p>
      <h1 className="mt-8 font-display text-5xl">Оплата замовлення №{o.id}</h1>
      <p className="num mt-4 text-3xl">{money(o.total)}</p>
      <ul className="stitch-t stitch-b mt-6 space-y-2 py-4 text-sm">
        {o.lines.map((l) => (
          <li key={l.variantId} className="flex justify-between gap-4">
            <span>{l.title}, {l.size} <span className="num text-mute">x{l.qty}</span></span>
            <span className="num">{money(l.price * l.qty)}</span>
          </li>
        ))}
      </ul>
      {o.status === "awaiting_payment" || o.status === "payment_failed" ? (
        <form action={decide} className="mt-8 grid gap-3">
          <input type="hidden" name="id" value={o.id} />
          <input type="hidden" name="t" value={t} />
          <button name="outcome" value="paid" className="btn">Оплатити (успіх)</button>
          <button name="outcome" value="failed" className="btn btn-ghost">Відхилити (помилка оплати)</button>
        </form>
      ) : (
        <p className="mt-8 text-mute">Це замовлення вже оплачено.</p>
      )}
    </div>
  );
}
