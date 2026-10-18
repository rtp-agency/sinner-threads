import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/checkout", "/cart", "/order/", "/en/checkout", "/en/cart", "/en/order/", "/dev/", "/en/dev/", "/pay/"] }, sitemap: `${SITE.url}/sitemap.xml` };
}
