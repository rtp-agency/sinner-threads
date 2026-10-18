export const LOCALES = ["uk", "en"] as const;
export type Lang = (typeof LOCALES)[number];
export const DEFAULT_LANG: Lang = "uk";
export const langFrom = (v: unknown): Lang => (typeof v === "string" && (LOCALES as readonly string[]).includes(v) ? (v as Lang) : DEFAULT_LANG);
export const isLang = (v: string): v is Lang => (LOCALES as readonly string[]).includes(v);

/** Українська живе без префікса (/catalog), англійська під /en (/en/catalog). */
export function href(lang: Lang, path: string): string {
  if (!path.startsWith("/")) return path; // зовнішні та якорі не чіпаємо
  if (lang === DEFAULT_LANG) return path;
  return path === "/" ? "/en" : `/en${path}`;
}

/** Знімає префікс мови зі шляху: /en/catalog -> /catalog */
export function stripLang(pathname: string): string {
  return pathname === "/en" ? "/" : pathname.startsWith("/en/") ? pathname.slice(3) : pathname;
}
