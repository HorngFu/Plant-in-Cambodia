import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { PlantSearch, type Option, type SearchText } from "@/components/search/PlantSearch";
import type { Locale } from "@/i18n/routing";
import { getFamilies, getHabitats, getProvinces } from "@/lib/content";
import { GROWTH_FORMS, IUCN_STATUSES, MONTHS, ORIGIN_STATUSES, USES } from "@/lib/content/vocab";
import { placeName } from "@/lib/localize";
import { pageMetadata } from "@/lib/metadata";
import type { Facet } from "@/lib/search";
import { getSearchIndex } from "@/lib/search-data";

const FIRST_PAGE = 48;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/plants">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "plants" });
  return pageMetadata({
    locale,
    path: "/plants",
    title: t("title"),
    description: t("description"),
  });
}

export default async function PlantsPage({ params }: PageProps<"/[locale]/plants">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const [t, vocab, families, provinces, habitats] = await Promise.all([
    getTranslations({ locale, namespace: "plants" }),
    getTranslations({ locale, namespace: "vocab" }),
    getFamilies(),
    getProvinces(),
    getHabitats(),
  ]);
  const { plants } = getSearchIndex();

  const byLabel = (a: Option, b: Option) => a.label.localeCompare(b.label, locale);
  const place = (item: { slug: string; name: string; khmerName?: string }): Option => {
    const name = placeName(item, locale);
    return { value: item.slug, label: name.text, lang: name.lang };
  };
  const usedFamilies = new Set(plants.map((p) => p.f));
  const options: Record<Facet, Option[]> = {
    family: families
      .filter((f) => usedFamilies.has(f.slug))
      .map((f) => ({ value: f.slug, label: f.name })),
    growth: GROWTH_FORMS.map((g) => ({ value: g.value, label: vocab(`growthForm.${g.value}`) })),
    origin: ORIGIN_STATUSES.map((o) => ({ value: o.value, label: vocab(`origin.${o.value}`) })),
    iucn: IUCN_STATUSES.map((s) => ({
      value: s.value,
      label: `${s.value} · ${vocab(`iucn.${s.value}`)}`,
    })),
    province: provinces.map(place).sort(byLabel),
    habitat: habitats.map(place).sort(byLabel),
    use: USES.map((u) => ({ value: u.value, label: vocab(`use.${u.value}`) })),
    month: MONTHS.map((m) => ({ value: m.value, label: vocab(`month.${m.value as "1"}`) })),
  };

  // ICU plural templates for the browser: format with a marker number, then swap it for "{n}".
  const marker = 7_654_321;
  const results = {
    zero: t("results", { count: 0 }),
    one: t("results", { count: 1 }),
    other: t("results", { count: marker }).replace(marker.toLocaleString(locale), "{n}"),
  };

  const text: SearchText = {
    searchLabel: t("searchLabel"),
    searchPlaceholder: t("searchPlaceholder"),
    results,
    noResults: t("noResults"),
    noResultsHint: t("noResultsHint"),
    loading: t("loading"),
    filters: t("filters"),
    clearAll: t("clearAll"),
    showMore: t("showMore"),
    sortLabel: t("sortLabel"),
    sort: {
      relevance: t("sort.relevance"),
      name: t("sort.name"),
      khmer: t("sort.khmer"),
      updated: t("sort.updated"),
    },
    facet: {
      family: t("facet.family"),
      growth: t("facet.growth"),
      origin: t("facet.origin"),
      iucn: t("facet.iucn"),
      province: t("facet.province"),
      habitat: t("facet.habitat"),
      use: t("facet.use"),
      month: t("facet.month"),
    },
    any: t("any"),
    photos: t("photos"),
    removeFilter: t.raw("removeFilter") as string,
    iucn: Object.fromEntries(IUCN_STATUSES.map((s) => [s.value, vocab(`iucn.${s.value}`)])),
    origin: Object.fromEntries(ORIGIN_STATUSES.map((o) => [o.value, vocab(`origin.${o.value}`)])),
  };

  const initial = [...plants].sort((a, b) => a.n.localeCompare(b.n)).slice(0, FIRST_PAGE);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="mt-1 text-muted">{t("count", { count: plants.length })}</p>
        </div>
        <nav className="flex gap-4 text-sm font-medium">
          <Link locale={locale} href="/a-z" className="text-accent hover:underline">
            {t("browseAz")} →
          </Link>
          <Link locale={locale} href="/families" className="text-accent hover:underline">
            {t("browseFamilies")} →
          </Link>
        </nav>
      </div>
      <PlantSearch
        locale={locale}
        initial={initial}
        total={plants.length}
        options={options}
        familyNames={Object.fromEntries(families.map((f) => [f.slug, f.name]))}
        text={text}
      />
    </div>
  );
}
