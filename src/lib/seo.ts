import type { Metadata } from "next";
import { href, LOCALES, type Lang } from "@/i18n/config";
import { SITE } from "./site";

/** canonical + hreflang для сторінки: path без префікса мови, напр. "/catalog". */
export function alternates(lang: Lang, path: string): Metadata["alternates"] {
  return {
    canonical: `${SITE.url}${href(lang, path)}`,
    languages: { ...Object.fromEntries(LOCALES.map((l) => [l, `${SITE.url}${href(l, path)}`])), "x-default": `${SITE.url}${path}` },
  };
}
