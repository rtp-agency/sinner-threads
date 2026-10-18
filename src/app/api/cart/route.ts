import { NextResponse } from "next/server";
import { getCart, mutateCart } from "@/lib/cart-server";
import { clientIp, rateLimit, sameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

const int = (v: unknown) => Math.floor(Number(v));
const guard = (req: Request) =>
  !sameOrigin(req) ? NextResponse.json({ message: "Заборонено" }, { status: 403 })
  : !rateLimit(`cart:${clientIp(req)}`, 90, 60_000) ? NextResponse.json({ message: "Забагато запитів" }, { status: 429 })
  : null;

export async function GET() {
  return NextResponse.json(await getCart());
}

/** Додати позицію: { productId, variantId, qty? } */
export async function POST(req: Request) {
  const g = guard(req); if (g) return g;
  const b = await req.json().catch(() => null);
  const productId = int(b?.productId), variantId = int(b?.variantId), qty = int(b?.qty ?? 1);
  if (!(productId > 0) || !(variantId > 0) || !(qty > 0 && qty <= 20)) return NextResponse.json({ message: "Некоректні дані" }, { status: 400 });
  const cart = await mutateCart((lines) => {
    const f = lines.find((l) => l.variantId === variantId);
    if (f) f.qty += qty;
    else lines.push({ productId, variantId, qty });
    return lines;
  });
  return NextResponse.json(cart);
}

/** Змінити кількість: { variantId, qty } */
export async function PATCH(req: Request) {
  const g = guard(req); if (g) return g;
  const b = await req.json().catch(() => null);
  const variantId = int(b?.variantId), qty = int(b?.qty);
  if (!(variantId > 0) || !(qty >= 0 && qty <= 20)) return NextResponse.json({ message: "Некоректні дані" }, { status: 400 });
  const cart = await mutateCart((lines) => lines.map((l) => (l.variantId === variantId ? { ...l, qty } : l)).filter((l) => l.qty > 0));
  return NextResponse.json(cart);
}

/** DELETE /api/cart?variantId=123 прибирає позицію, без параметра очищає кошик */
export async function DELETE(req: Request) {
  const g = guard(req); if (g) return g;
  const v = new URL(req.url).searchParams.get("variantId");
  const cart = await mutateCart((lines) => (v ? lines.filter((l) => l.variantId !== Number(v)) : []));
  return NextResponse.json(cart);
}
