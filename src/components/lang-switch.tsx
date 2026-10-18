"use client";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { href, stripLang } from "@/i18n/config";
import { useLang, useT } from "@/i18n/context";

/** Перемикач UA / EN: веде на ту саму сторінку іншою мовою і запамʼятовує вибір у cookie. */
export function LangSwitch() {
  const lang = useLang();
  const t = useT();
  const path = stripLang(usePathname());
  return (
    <div role="group" aria-label={t.nav.lang} className="flex items-center font-mono text-xs uppercase tracking-widest">
      {(["uk", "en"] as const).map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span aria-hidden className="mx-1 text-mute">/</span>}
          <NextLink
            href={href(l, path)}
            hrefLang={l}
            lang={l}
            aria-current={l === lang ? "true" : undefined}
            onClick={() => { document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`; }}
            className={`inline-flex min-h-11 min-w-8 items-center justify-center ${l === lang ? "underline underline-offset-8" : "text-mute hover:text-ink"}`}
          >
            {l === "uk" ? "UA" : "EN"}
          </NextLink>
        </span>
      ))}
    </div>
  );
}
