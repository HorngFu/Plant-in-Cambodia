import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { SITE_NAME, SITE_URL } from "./site";

/**
 * Per-page metadata: title, description, canonical URL, hreflang alternates and social cards.
 * `path` is the path after the locale, e.g. "/plants/hopea-odorata" ("" for the home page).
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: Locale;
  path: string;
  title?: string;
  description: string;
}): Metadata {
  const url = (l: Locale) => `${SITE_URL}/${l}${path}`;
  const fullTitle = title ? `${title} · ${SITE_NAME[locale]}` : SITE_NAME[locale];

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url(locale),
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, url(l)])),
        "x-default": url(routing.defaultLocale),
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME[locale],
      title: title ?? SITE_NAME[locale],
      description,
      url: url(locale),
      locale: locale === "km" ? "km_KH" : "en_US",
      alternateLocale: locale === "km" ? "en_US" : "km_KH",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE_NAME[locale] }],
    },
    twitter: { card: "summary_large_image" },
  };
}

/** Keep descriptions within what search engines show. */
export function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}
