import type { MetadataRoute } from "next";
import { isTodo, settings } from "@/content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    ...(isTodo(settings.siteUrl) ? {} : { sitemap: `${settings.siteUrl}/sitemap.xml` }),
  };
}
