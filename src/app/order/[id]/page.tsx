import Link from "next/link";
import type { Metadata } from "next";
import { getOrder } from "@/lib/orders";
import { money } from "@/lib/format";
import { validOrderToken } from "@/lib/security";

export const metadata: Metadata = { title: "Ваше замовлення", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function OrderDone({ params, searchParams }: PageProps<"/order/[id]">) {
  const id = Number((await params).id);
  const t = (await searchParams).t;
  // Без дійсного токена деталі (імʼя, телефон, адреса) не показуємо
  const o = validOrderToken(id, typeof t === "string" ? t : undefined) ? await getOrder(id) : null;

  const head = !o
    ? { t: `Замовлення №${id}`, d: "Деталі замовлення доступні за персональним посиланням із підтвердження. Якщо ви оформлювали замовлення, воно вже в роботі." }
    : o.status === "payment_failed"
      ? { t: "Оплата не пройшла", d: "Гроші не списано. Оформіть замовлення ще раз або оберіть оплату при отриманні." }
      : o.status === "awaiting_payment"
        ? { t: "Чекаємо підтвердження оплати", d: "Зазвичай це займає кілька секунд. Оновіть сторінку трохи згодом." }
        : o.payment === "cod"
          ? { t: "Замовлення прийнято", d: "Ми передали замовлення на склад. Коли посилку відправимо, надішлемо ТТН у повідомленні. Оплата при отриманні у відділенні Нової пошти." }
          : { t: "Дякуємо за оплату", d: "Замовлення вже в роботі. ТТН надішлемо у повідомленні на ваш телефон." };

  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <p className="num text-sm text-mute">Замовлення №{id}</p>
      <h1 className="mt-3 font-display text-5xl">{head.t}</h1>
      <p className="mt-5 leading-relaxed text-mute">{head.d}</p>
      {o && (
        <div className="stitch mt-8 p-5">
          <ul className="space-y-2 text-sm">
            {o.lines.map((l) => (
              <li key={l.variantId} className="flex justify-between gap-4">
                <span>{l.title}, {l.size} <span className="num text-mute">x{l.qty}</span></span>
                <span className="num shrink-0">{money(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <p className="stitch-t num mt-4 flex justify-between pt-3"><span className="font-sans text-sm">Разом</span>{money(o.total)}</p>
          <p className="mt-4 text-sm text-mute">{o.customer.city}, відділення {o.customer.warehouse}. {o.payment === "cod" ? "Оплата при отриманні." : "Оплачено карткою."}</p>
        </div>
      )}
      <Link href={o?.status === "payment_failed" ? "/cart" : "/catalog"} className="btn mt-10">{o?.status === "payment_failed" ? "Повернутись до кошика" : "Продовжити покупки"}</Link>
    </div>
  );
}
