import Link from "next/link";

/** Знак: літера S, прошита однією ниткою. Будується з тексту, без намальованих іконок. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="sinnerThreads, на головну" className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className="font-display text-3xl leading-none">SINNER</span>
      <span aria-hidden className="hidden h-px w-6 self-center border-t border-dashed border-current sm:block" />
      <span className="font-display text-3xl leading-none text-transparent [-webkit-text-stroke:1px_var(--ink)]">THREADS</span>
    </Link>
  );
}
