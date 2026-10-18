"use client";
import { useT } from "@/i18n/context";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const t = useT();
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-4xl">{t.error.t}</h1>
      <p className="mt-4 text-mute">{t.error.d}</p>
      <button onClick={reset} className="btn mt-8">{t.error.retry}</button>
    </div>
  );
}
