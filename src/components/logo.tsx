"use client";
import Link from "./loc-link";
import { useT } from "@/i18n/context";

/** Логотип з тексту: SINNER залитий, THREADS контуром, між ними пунктир-шов. */
export function Logo({ className = "" }: { className?: string }) {
  const t = useT();
  return (
    <Link href="/" aria-label={t.logoLabel} className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className="font-display text-3xl leading-none">SINNER</span>
      <span aria-hidden className="hidden h-px w-6 self-center border-t border-dashed border-current sm:block" />
      <span className="font-display text-3xl leading-none text-transparent [-webkit-text-stroke:1px_var(--ink)]">THREADS</span>
    </Link>
  );
}
