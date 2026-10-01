import type { MetadataRoute } from "next";
import { getAllRecipes, getCollections } from "@/lib/content";
import { site } from "@/site.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${site.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/explorar`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site.url}/colecoes`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...getCollections().map((c) => ({ url: `${site.url}/colecoes/${c.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...getAllRecipes().map((r) => ({ url: `${site.url}/receitas/${r.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
