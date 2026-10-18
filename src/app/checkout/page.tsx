import type { Metadata } from "next";
import { activeProvider } from "@/lib/payments";
import { orderMode } from "@/lib/orders";
import { CheckoutForm } from "./form";

// Залежить від env (платіжка, режим), тому не prerender-имо на білді
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Оформлення замовлення", robots: { index: false } };

export default function CheckoutPage() {
  return <CheckoutForm cardEnabled={activeProvider() !== null} demo={orderMode() === "demo"} />;
}
