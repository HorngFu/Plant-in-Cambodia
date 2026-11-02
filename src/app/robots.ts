import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Block all indexing until launch (Phase 10). The sitemap is ready for then.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
