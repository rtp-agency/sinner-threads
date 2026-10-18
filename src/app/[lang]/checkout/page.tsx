import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { activeProvider } from "@/lib/payments";
import { orderMode } from "@/lib/orders";
import { isLang } from "@/i18n/config";
import { dict } from "@/i18n/dict";
import { CheckoutForm } from "./form";

// Залежить від env (платіжка, режим), тому не prerender-имо на білді
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[lang]/checkout">): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? { title: dict(lang).checkout.meta, robots: { index: false } } : {};
}

export default async function CheckoutPage({ params }: PageProps<"/[lang]/checkout">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <CheckoutForm cardEnabled={activeProvider() !== null} demo={orderMode() === "demo"} />;
}
