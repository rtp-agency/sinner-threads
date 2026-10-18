import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getCatalog } from "@/lib/mydrop";
import { href, LOCALES } from "@/i18n/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await getCatalog();
  const paths = ["/", "/catalog", ...["offer", "privacy", "returns", "delivery"].map((s) => `/legal/${s}`), ...products.map((p) => `/product/${p.id}`)];
  return paths.map((path) => ({
    url: `${SITE.url}${href("uk", path)}`,
    alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE.url}${href(l, path)}`])) },
  }));
}
