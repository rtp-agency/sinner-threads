"use client";
import Link from "next/link";
import { ShoppingBag } from "@phosphor-icons/react";
import { Logo } from "./logo";
import { useCart } from "./cart";

const NAV = [
  { href: "/catalog", label: "Каталог" },
  { href: "/catalog?stock=1", label: "В наявності" },
  { href: "/legal/delivery", label: "Доставка" },
];

export function Header() {
  const { count, ready } = useCart();
  return (
    <header className="solid-b sticky top-0 z-40 bg-paper">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-4 md:px-8">
        <Logo />
        <nav aria-label="Основна" className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="font-mono text-xs uppercase tracking-widest hover:underline underline-offset-8">
              {n.label}
            </Link>
          ))}
        </nav>
        <Link href="/cart" className="relative inline-flex min-h-11 items-center gap-2 font-mono text-xs uppercase tracking-widest" aria-label={`Кошик, товарів: ${ready ? count : 0}`}>
          <ShoppingBag size={22} weight="regular" />
          <span className="num min-w-[1.25rem] border border-ink px-1 text-center">{ready ? count : 0}</span>
        </Link>
      </div>
      <nav aria-label="Основна, мобільна" className="stitch-t flex gap-6 overflow-x-auto px-4 py-2 md:hidden">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="whitespace-nowrap font-mono text-[11px] uppercase tracking-widest">
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
