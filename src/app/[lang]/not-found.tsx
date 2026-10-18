"use client";
import Link from "@/components/loc-link";
import { useT } from "@/i18n/context";

export default function NotFound() {
  const t = useT();
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="num text-sm text-mute">404</p>
      <h1 className="mt-2 font-display text-5xl">{t.notFound.t}</h1>
      <p className="mt-4 text-mute">{t.notFound.d}</p>
      <Link href="/catalog" className="btn mt-8">{t.notFound.cta}</Link>
    </div>
  );
}
