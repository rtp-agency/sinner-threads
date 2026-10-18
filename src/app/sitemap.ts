import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getCatalog } from "@/lib/mydrop";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await getCatalog();
  return [
    { url: SITE.url }, { url: `${SITE.url}/catalog` },
    ...products.map((p) => ({ url: `${SITE.url}/product/${p.id}` })),
  ];
}
