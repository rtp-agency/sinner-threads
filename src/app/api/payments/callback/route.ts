import { NextResponse } from "next/server";
import { getOrder, settlePayment } from "@/lib/orders";
import { verifyLiqpay, verifyWayforpay } from "@/lib/payments";

/** Серверний callback від LiqPay (form-urlencoded: data, signature) або WayForPay (JSON). */
export async function POST(req: Request) {
  const ct = req.headers.get("content-type") ?? "";
  let result: { orderId: number; paid: boolean; amount: number; currency: string } | null = null;
  let reply: unknown = { ok: true };

  if (ct.includes("application/x-www-form-urlencoded")) {
    const f = await req.formData();
    result = verifyLiqpay(String(f.get("data") ?? ""), String(f.get("signature") ?? ""));
  } else {
    let body: Record<string, unknown> = {};
    try { body = JSON.parse(await req.text()); } catch {}
    const v = verifyWayforpay(body);
    if (v) { result = v; reply = v.reply; }
  }

  if (!result) return NextResponse.json({ message: "bad signature" }, { status: 400 });
  if (Number.isFinite(result.orderId)) {
    try {
      if (result.paid) {
        // Підписаний callback може прийти на меншу суму (платіж за інше замовлення, підміна): такий не зараховуємо
        const o = await getOrder(result.orderId);
        if (!o || o.payment !== "card" || result.currency !== "UAH" || Math.round(result.amount) !== o.total) {
          console.error("[payments/callback] amount mismatch", { id: result.orderId, got: result.amount, want: o?.total });
          return NextResponse.json(reply);
        }
      }
      await settlePayment(result.orderId, result.paid);
    } catch (e) {
      console.error("[payments/callback]", e);
      return NextResponse.json({ message: "retry" }, { status: 500 }); // платіжка повторить
    }
  }
  return NextResponse.json(reply);
}
