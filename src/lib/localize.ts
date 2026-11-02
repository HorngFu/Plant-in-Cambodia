import type { Locale } from "@/i18n/routing";

type Bilingual = { readonly km?: string; readonly en?: string } | undefined;

export type Localized = { text: string; lang: Locale; isFallback: boolean };

/** Text in the page's language, falling back to the other language (marked so the UI can say so). */
export function pick(value: Bilingual, locale: Locale): Localized | null {
  const other: Locale = locale === "km" ? "en" : "km";
  const own = value?.[locale]?.trim();
  if (own) return { text: own, lang: locale, isFallback: false };
  const fallback = value?.[other]?.trim();
  if (fallback) return { text: fallback, lang: other, isFallback: true };
  return null;
}

type Named = {
  scientificName: string;
  khmerName: string;
  englishName: string;
};

/** The main common name for a plant in this language (scientific name if there is none). */
export function commonName(plant: Named, locale: Locale): { text: string; lang: Locale } | null {
  if (locale === "km" && plant.khmerName) return { text: plant.khmerName, lang: "km" };
  if (plant.englishName) return { text: plant.englishName, lang: "en" };
  if (plant.khmerName) return { text: plant.khmerName, lang: "km" };
  return null;
}

/** Plain-text title for <title> and social cards. */
export function plantTitle(plant: Named, locale: Locale): string {
  const name = commonName(plant, locale);
  return name ? `${name.text} (${plant.scientificName})` : plant.scientificName;
}

/** Province, habitat or family name in this language. */
export function placeName(
  item: { name: string; khmerName?: string },
  locale: Locale,
): { text: string; lang: Locale } {
  return locale === "km" && item.khmerName
    ? { text: item.khmerName, lang: "km" }
    : { text: item.name, lang: "en" };
}
