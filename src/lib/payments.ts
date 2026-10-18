import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { SITE } from "./site";

/** Тестова оплата і службові сторінки: локально завжди, на проді тільки з ALLOW_DEMO=1 (превʼю без реальних грошей). */
export const demoEnabled = () => process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO === "1";

export type Provider = "demo" | "liqpay" | "wayforpay";

export type PaymentForm = { url: string; method: "POST" | "GET"; fields: Record<string, string> };

/** Повертає активного провайдера або null: тоді на чекауті лишається лише накладений платіж. */
export function activeProvider(): Provider | null {
  const p = process.env.PAYMENT_PROVIDER;
  // demo на проді тільки свідомо (ALLOW_DEMO=1): інакше була б «оплата» без грошей
  if (p === "demo" && demoEnabled()) return "demo";
  if (p === "liqpay" && process.env.LIQPAY_PUBLIC_KEY && process.env.LIQPAY_PRIVATE_KEY) return "liqpay";
  if (p === "wayforpay" && process.env.WAYFORPAY_MERCHANT_ACCOUNT && process.env.WAYFORPAY_MERCHANT_SECRET && process.env.WAYFORPAY_MERCHANT_DOMAIN) return "wayforpay";
  return null;
}

const sha1b64 = (s: string) => createHash("sha1").update(s).digest("base64");
const safeEq = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export type PayOrder = {
  orderId: number;
  amount: number;
  lines: { name: string; qty: number; price: number }[];
  phone: string;
  clientName: string;
};

// order_id для провайдера = "<id замовлення МійДроп>-<мітка часу>", щоб можна було повторити спробу оплати
export const refFor = (id: number) => `${id}-${Date.now()}`;
export const orderIdFromRef = (ref: string) => Number(String(ref).split("-")[0]);

// ---------- LiqPay ----------
export function liqpayForm(o: PayOrder): PaymentForm {
  const priv = process.env.LIQPAY_PRIVATE_KEY!;
  const payload = {
    version: 3,
    public_key: process.env.LIQPAY_PUBLIC_KEY,
    action: "pay",
    amount: o.amount,
    currency: "UAH",
    description: `Замовлення ${SITE.name} №${o.orderId}`,
    order_id: refFor(o.orderId),
    language: "uk",
    result_url: `${SITE.url}/order/${o.orderId}`,
    server_url: `${SITE.url}/api/payments/callback`,
    sandbox: process.env.LIQPAY_SANDBOX === "1" ? 1 : undefined,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64");
  return { url: "https://www.liqpay.ua/api/3/checkout", method: "POST", fields: { data, signature: sha1b64(priv + data + priv) } };
}

export function verifyLiqpay(data: string, signature: string) {
  const priv = process.env.LIQPAY_PRIVATE_KEY;
  if (!priv) return null;
  if (!safeEq(sha1b64(priv + data + priv), signature)) return null;
  const j = JSON.parse(Buffer.from(data, "base64").toString("utf8")) as { status: string; order_id: string };
  return { orderId: orderIdFromRef(j.order_id), paid: j.status === "success" || j.status === "sandbox" };
}

// ---------- WayForPay ----------
const hmacMd5 = (secret: string, s: string) => createHmac("md5", secret).update(s).digest("hex");

export function wayforpayForm(o: PayOrder): PaymentForm {
  const secret = process.env.WAYFORPAY_MERCHANT_SECRET!;
  const account = process.env.WAYFORPAY_MERCHANT_ACCOUNT!;
  const domain = process.env.WAYFORPAY_MERCHANT_DOMAIN!;
  const ref = refFor(o.orderId);
  const date = Math.floor(Date.now() / 1000);
  const names = o.lines.map((l) => l.name);
  const counts = o.lines.map((l) => l.qty);
  const prices = o.lines.map((l) => l.price);
  const signStr = [account, domain, ref, date, o.amount, "UAH", ...names, ...counts, ...prices].join(";");
  const fields: Record<string, string> = {
    merchantAccount: account,
    merchantAuthType: "SimpleSignature",
    merchantDomainName: domain,
    merchantSignature: hmacMd5(secret, signStr),
    orderReference: ref,
    orderDate: String(date),
    amount: String(o.amount),
    currency: "UAH",
    returnUrl: `${SITE.url}/order/${o.orderId}`,
    serviceUrl: `${SITE.url}/api/payments/callback`,
    language: "UA",
    clientFirstName: o.clientName,
    clientPhone: o.phone,
  };
  const multi: Record<string, string> = {};
  names.forEach((n, i) => (multi[`productName[${i}]`] = n));
  counts.forEach((n, i) => (multi[`productCount[${i}]`] = String(n)));
  prices.forEach((n, i) => (multi[`productPrice[${i}]`] = String(n)));
  return { url: "https://secure.wayforpay.com/pay", method: "POST", fields: { ...fields, ...multi } };
}

export function verifyWayforpay(b: Record<string, unknown>) {
  const secret = process.env.WAYFORPAY_MERCHANT_SECRET;
  if (!secret) return null;
  const parts = ["merchantAccount", "orderReference", "amount", "currency", "authCode", "cardPan", "transactionStatus", "reasonCode"].map((k) => String(b[k] ?? ""));
  if (!safeEq(hmacMd5(secret, parts.join(";")), String(b.merchantSignature ?? ""))) return null;
  const ref = String(b.orderReference);
  const time = Math.floor(Date.now() / 1000);
  const status = "accept";
  return {
    orderId: orderIdFromRef(ref),
    paid: b.transactionStatus === "Approved",
    reply: { orderReference: ref, status, time, signature: hmacMd5(secret, [ref, status, time].join(";")) },
  };
}

// ---------- Demo ----------
/** Тестова оплата без платіжки: ведемо на нашу сторінку з кнопками «успіх / відхилено». */
export function demoForm(o: PayOrder): PaymentForm {
  return { url: `/pay/demo/${o.orderId}`, method: "GET", fields: {} };
}
