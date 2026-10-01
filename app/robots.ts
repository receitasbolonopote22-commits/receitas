import type { MetadataRoute } from "next";
import { site } from "@/site.config";

export default function robots(): MetadataRoute.Robots {
  if (!site.allowIndexing) {
    // Produto pago sem login ainda: pedimos aos buscadores para não indexar.
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return { rules: { userAgent: "*", allow: "/", disallow: ["/favoritos"] }, sitemap: `${site.url}/sitemap.xml`, host: site.url };
}
