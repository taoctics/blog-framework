import type { MetadataRoute } from "next";

import { blogConfig } from "@/blog.config";
import { getAbsoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"]
      }
    ],
    sitemap: getAbsoluteUrl("/sitemap.xml"),
    host: blogConfig.site.url
  };
}
