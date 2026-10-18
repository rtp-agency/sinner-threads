import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Oswald, Onest, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import { SITE } from "@/lib/site";
import { CartProvider } from "@/components/cart";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ThreadBackground } from "@/components/thread-background";
import { LangProvider } from "@/i18n/context";
import { LOCALES, isLang } from "@/i18n/config";
import { dict } from "@/i18n/dict";
import { cn } from "@/lib/utils";

// Display: Oswald (вузький, є кирилиця) капсом для заголовків і логотипа. Текст: Onest. Ярлики і ціни: JetBrains Mono.
const oswald = Oswald({ variable: "--font-display-src", subsets: ["latin", "cyrillic"], weight: ["500", "600"] });
const onest = Onest({ variable: "--font-onest", subsets: ["latin", "cyrillic"] });
const jb = JetBrains_Mono({ variable: "--font-jb", subsets: ["latin", "cyrillic"] });

export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const d = dict(lang);
  return {
    metadataBase: new URL(SITE.url),
    title: { default: `${SITE.name}: ${d.meta.title}`, template: `%s | ${SITE.name}` },
    description: d.meta.description,
    openGraph: { siteName: SITE.name, locale: lang === "uk" ? "uk_UA" : "en_US", type: "website" },
  };
}
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#0d0d0d" }, { color: "#f6f6f4" }] };

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <html lang={dict(lang).htmlLang} className={cn(oswald.variable, onest.variable, jb.variable, "font-sans")}>
      <body className="min-h-dvh flex flex-col">
        <ThreadBackground />
        <LangProvider lang={lang}>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer lang={lang} />
          </CartProvider>
        </LangProvider>
      </body>
    </html>
  );
}
