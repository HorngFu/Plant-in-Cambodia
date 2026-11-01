import type { MetadataRoute } from "next";

// Block all indexing until launch (Phase 10).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
