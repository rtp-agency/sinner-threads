import type { Metadata, Viewport } from "next";
import { Oswald, Onest, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import { CartProvider } from "@/components/cart";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ThreadBackground } from "@/components/thread-background";
import { cn } from "@/lib/utils";

// Display: Oswald (вузький, є кирилиця) капсом для заголовків і логотипа. Текст: Onest. Ярлики і ціни: JetBrains Mono.
const oswald = Oswald({ variable: "--font-display-src", subsets: ["latin", "cyrillic"], weight: ["500", "600"] });
const onest = Onest({ variable: "--font-onest", subsets: ["latin", "cyrillic"] });
const jb = JetBrains_Mono({ variable: "--font-jb", subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: брендовий одяг та аксесуари`, template: `%s | ${SITE.name}` },
  description: "Худі, пуховики, джинси, сумки та аксесуари відомих брендів. Реальна наявність розмірів, доставка Новою поштою по Україні.",
  openGraph: { siteName: SITE.name, locale: "uk_UA", type: "website" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#0d0d0d" }, { color: "#f6f6f4" }] };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" className={cn(oswald.variable, onest.variable, jb.variable, "font-sans")}>
      <body className="min-h-dvh flex flex-col">
        <ThreadBackground />
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
