import type { Metadata } from "next";
import { activeProvider } from "@/lib/payments";
import { CheckoutForm } from "./form";

export const metadata: Metadata = { title: "Оформлення замовлення", robots: { index: false } };

export default function CheckoutPage() {
  return <CheckoutForm cardEnabled={activeProvider() !== null} />;
}
