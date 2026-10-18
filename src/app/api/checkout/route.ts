import { NextResponse } from "next/server";
import { clearCartRecord, hydrate, rawCartLines } from "@/lib/cart-server";
import { MyDropError } from "@/lib/mydrop";
import { createOrder, placeCod } from "@/lib/orders";
import { activeProvider, demoForm, liqpayForm, wayforpayForm } from "@/lib/payments";
import { clean, clientIp, orderPath, orderToken, rateLimit, sameOrigin } from "@/lib/security";
import { langFrom, type Lang } from "@/i18n/config";
import { dict } from "@/i18n/dict";

type Body = {
  name?: string; phone?: string; city?: string; warehouse?: string; comment?: string;
  payment?: "cod" | "card"; accept?: boolean; lang?: string;
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
  const hdrLang = langFrom(req.headers.get("x-lang"));
  if (!sameOrigin(req)) return fail(dict(hdrLang).api.forbidden, 403);
  if (!rateLimit(`checkout:${clientIp(req)}`, 6, 60_000)) return fail(dict(hdrLang).api.tooManyTries, 429);
  let b: Body;
  try { b = await req.json(); } catch { return fail(dict(hdrLang).api.badRequest); }
  const lang: Lang = langFrom(b.lang ?? hdrLang);
  const a = dict(lang).api;

  const name = clean(b.name, 80);
  const city = clean(b.city, 60);
  const warehouse = clean(b.warehouse, 40);
  const phone = normPhone(b.phone ?? "");
  if (name.length < 2) return fail(a.name, 400, "name");
  if (!phone) return fail(a.phone, 400, "phone");
  if (city.length < 2) return fail(a.city, 400, "city");
  if (!warehouse) return fail(a.warehouse, 400, "warehouse");
  if (!b.accept) return fail(a.accept, 400, "accept");

  const { view } = await hydrate(await rawCartLines(), lang);
  if (view.lines.length === 0) return fail(a.empty);
  if (view.notices.length) return fail(view.notices[0], 409);

  const card = b.payment === "card";
  const provider = activeProvider();
  if (card && !provider) return fail(a.noCard);

  try {
    const order = await createOrder({
      payment: card ? "card" : "cod",
      provider: card ? provider : null,
      total: view.total,
      customer: { name, phone, city, warehouse, comment: clean(b.comment, 300) || undefined },
      lines: view.lines.map((l) => ({ productId: l.productId, variantId: l.variantId, qty: l.qty, price: l.price, title: l.title, size: l.size, image: l.image })),
    });

    if (card) {
      const o = { orderId: order.id, lang, token: orderToken(order.id), amount: view.total, lines: view.lines.map((l) => ({ name: `${l.title} (${l.size})`, qty: l.qty, price: l.price })), phone, clientName: name };
      const form = provider === "liqpay" ? liqpayForm(o) : provider === "wayforpay" ? wayforpayForm(o) : demoForm(o);
      await clearCartRecord();
      return NextResponse.json({ orderId: order.id, pay: form });
    }
    await placeCod(order.id);
    await clearCartRecord();
    return NextResponse.json({ orderId: order.id, path: orderPath(order.id) });
  } catch (e) {
    console.error("[checkout]", e);
    const msg = e instanceof MyDropError ? a.upstream : a.server;
    return fail(msg, 502);
  }
}
