import { NextResponse } from "next/server";
import { clearCartRecord, hydrate, rawCartLines } from "@/lib/cart-server";
import { MyDropError } from "@/lib/mydrop";
import { createOrder, placeCod } from "@/lib/orders";
import { activeProvider, demoForm, liqpayForm, wayforpayForm } from "@/lib/payments";

type Body = {
  name?: string; phone?: string; city?: string; warehouse?: string; comment?: string;
  payment?: "cod" | "card"; accept?: boolean;
};

const fail = (message: string, status = 400, field?: string) => NextResponse.json({ message, field }, { status });

function normPhone(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (/^380\d{9}$/.test(d)) return `+${d}`;
  if (/^0\d{9}$/.test(d)) return `+38${d}`;
  return null;
}

/** Склад замовлення береться з серверного кошика (cookie), ціни й залишки з каталогу. Клієнту довіри немає. */
export async function POST(req: Request) {
  let b: Body;
  try { b = await req.json(); } catch { return fail("Некоректний запит"); }

  const name = b.name?.trim() ?? "";
  const city = b.city?.trim() ?? "";
  const warehouse = b.warehouse?.trim() ?? "";
  const phone = normPhone(b.phone ?? "");
  if (name.length < 2) return fail("Вкажіть ім’я та прізвище", 400, "name");
  if (!phone) return fail("Телефон у форматі +380XXXXXXXXX", 400, "phone");
  if (city.length < 2) return fail("Вкажіть місто", 400, "city");
  if (!warehouse) return fail("Вкажіть номер відділення Нової пошти", 400, "warehouse");
  if (!b.accept) return fail("Потрібна згода з умовами оферти", 400, "accept");

  const { view, clean } = await hydrate(await rawCartLines());
  if (view.lines.length === 0) return fail("Кошик порожній");
  if (view.notices.length) return fail(view.notices[0], 409);
  void clean;

  const card = b.payment === "card";
  const provider = activeProvider();
  if (card && !provider) return fail("Оплата карткою поки недоступна. Оберіть накладений платіж.");

  try {
    const order = await createOrder({
      payment: card ? "card" : "cod",
      provider: card ? provider : null,
      total: view.total,
      customer: { name, phone, city, warehouse, comment: b.comment?.trim().slice(0, 300) || undefined },
      lines: view.lines.map((l) => ({ productId: l.productId, variantId: l.variantId, qty: l.qty, price: l.price, title: l.title, size: l.size, image: l.image })),
    });

    if (card) {
      const o = { orderId: order.id, amount: view.total, lines: view.lines.map((l) => ({ name: `${l.title} (${l.size})`, qty: l.qty, price: l.price })), phone, clientName: name };
      const form = provider === "liqpay" ? liqpayForm(o) : provider === "wayforpay" ? wayforpayForm(o) : demoForm(o);
      await clearCartRecord();
      return NextResponse.json({ orderId: order.id, pay: form });
    }
    await placeCod(order.id);
    await clearCartRecord();
    return NextResponse.json({ orderId: order.id });
  } catch (e) {
    console.error("[checkout]", e);
    const msg = e instanceof MyDropError ? "Не вдалося передати замовлення. Спробуйте ще раз або напишіть нам." : "Помилка сервера";
    return fail(msg, 502);
  }
}
