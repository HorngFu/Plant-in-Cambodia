import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getFamilies, getPageSlugs, getPlants, getProvinces } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

/** Every public page in both languages, with hreflang alternates. Generated at build time. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [plants, families, provinces, pages] = await Promise.all([
    getPlants(),
    getFamilies(),
    getProvinces(),
    getPageSlugs(),
  ]);

  const paths = [
    "",
    "/plants",
    "/families",
    "/provinces",
    ...plants.map((p) => `/plants/${p.slug}`),
    ...families.map((f) => `/families/${f.slug}`),
    ...provinces.map((p) => `/provinces/${p.slug}`),
    ...pages.map((slug) => `/${slug}`),
  ];

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`])),
      },
    })),
  );
}
