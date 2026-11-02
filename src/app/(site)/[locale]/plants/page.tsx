import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PlantCard, PlantGrid } from "@/components/PlantCard";
import { PlantFilter } from "@/components/PlantFilter";
import type { Locale } from "@/i18n/routing";
import { getPlants } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

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
  const t = await getTranslations({ locale, namespace: "plants" });
  const plants = await getPlants();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="mt-1 mb-8 text-muted">{t("count", { count: plants.length })}</p>
      <PlantFilter
        label={t("filterLabel")}
        placeholder={t("filterPlaceholder")}
        // Placeholders are filled in by the client component.
        noResults={t.raw("noResults") as string}
        showing={t.raw("showing") as string}
        items={plants.map((plant) => ({
          slug: plant.slug,
          text: [
            plant.scientificName,
            plant.khmerName,
            plant.khmerNameLatin,
            plant.englishName,
            ...plant.otherLocalNames,
            ...plant.synonyms,
          ].join(" "),
        }))}
      >
        <PlantGrid>
          {plants.map((plant) => (
            <li key={plant.slug} data-slug={plant.slug}>
              <PlantCard plant={plant} locale={locale} headingLevel={2} />
            </li>
          ))}
        </PlantGrid>
      </PlantFilter>
    </div>
  );
}
