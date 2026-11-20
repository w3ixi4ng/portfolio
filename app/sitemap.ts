import type { MetadataRoute } from "next";
import { isTodo, settings } from "@/content";

/** Needs an absolute URL, so it stays empty until settings.siteUrl is set in /admin. */
export default function sitemap(): MetadataRoute.Sitemap {
  if (isTodo(settings.siteUrl)) return [];
  const base = settings.siteUrl.replace(/\/$/, "");
  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/plain`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
