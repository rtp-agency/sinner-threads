"use client";
import { ShoppingBag } from "@phosphor-icons/react";
import Link from "./loc-link";
import { Logo } from "./logo";
import { LangSwitch } from "./lang-switch";
import { useCart } from "./cart";
import { useT } from "@/i18n/context";

export function Header() {
  const { count, ready } = useCart();
  const t = useT();
  const NAV = [
    { href: "/catalog", label: t.nav.catalog },
    { href: "/catalog?stock=1", label: t.nav.inStock },
    { href: "/legal/delivery", label: t.nav.delivery },
  ];
  const n = ready ? count : 0;
  return (
    <header className="solid-b sticky top-0 z-40 bg-paper">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-8">
        <Logo />
        <nav aria-label={t.nav.main} className="hidden items-center gap-8 md:flex">
          {NAV.map((x) => (
            <Link key={x.href} href={x.href} className="font-mono text-xs uppercase tracking-widest hover:underline underline-offset-8">{x.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 sm:gap-5">
          <LangSwitch />
          <Link href="/cart" className="relative inline-flex min-h-11 items-center gap-2 font-mono text-xs uppercase tracking-widest" aria-label={t.nav.cart(n)}>
            <ShoppingBag size={22} weight="regular" />
            <span className="num min-w-[1.25rem] border border-ink px-1 text-center">{n}</span>
          </Link>
        </div>
      </div>
      <nav aria-label={t.nav.mobile} className="stitch-t flex gap-6 overflow-x-auto px-4 md:hidden [scrollbar-width:none]">
        {NAV.map((x) => (
          <Link key={x.href} href={x.href} className="inline-flex min-h-11 items-center whitespace-nowrap font-mono text-xs uppercase tracking-widest">{x.label}</Link>
        ))}
      </nav>
    </header>
  );
}
