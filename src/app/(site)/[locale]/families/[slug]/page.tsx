import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocalizedText } from "@/components/LocalizedText";
import { PlantCard, PlantGrid } from "@/components/PlantCard";
import { LocaleLink as Link } from "@/components/LocaleLink";
import type { Locale } from "@/i18n/routing";
import { getFamilies, getPlantsBy } from "@/lib/content";
import { pick } from "@/lib/localize";
import { pageMetadata, truncate } from "@/lib/metadata";

type Props = PageProps<"/[locale]/families/[slug]">;

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getFamilies()).map((f) => ({ slug: f.slug }));
}

async function getFamily(slug: string) {
  return (await getFamilies()).find((f) => f.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  const family = await getFamily(slug);
  if (!family) return {};
  const t = await getTranslations({ locale, namespace: "families" });
  const text = pick(family.description, locale)?.text;
  return pageMetadata({
    locale,
    path: `/families/${slug}`,
    title: family.name,
    description: truncate(
      text ??
        `${family.name}${family.englishName ? ` (${family.englishName})` : ""}. ${t("description")}`,
    ),
  });
}

export default async function FamilyPage({ params }: Props) {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  setRequestLocale(locale);
  const family = await getFamily(slug);
  if (!family) notFound();

  const [t, nav, plants] = await Promise.all([
    getTranslations({ locale, namespace: "families" }),
    getTranslations({ locale, namespace: "nav" }),
    getPlantsBy("family", slug),
  ]);
  const description = pick(family.description, locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <Link locale={locale} href="/families" className="hover:underline">
          {nav("families")}
        </Link>
      </nav>
      <header className="mb-8 flex flex-col gap-2 border-b border-border pb-6">
        <h1 className="text-3xl font-bold">{family.name}</h1>
        <p className="text-muted">
          {[locale === "km" ? family.khmerName : "", family.englishName]
            .filter(Boolean)
            .join(" · ")}
          {family.order && (
            <>
              {(family.englishName || family.khmerName) && " · "}
              {t("order")}: {family.order}
            </>
          )}
        </p>
        {description && <LocalizedText value={description} locale={locale} className="max-w-3xl" />}
      </header>
      <h2 className="mb-4 text-xl font-bold">
        {t("plantsIn")} <span className="font-normal text-muted">({plants.length})</span>
      </h2>
      {plants.length > 0 ? (
        <PlantGrid>
          {plants.map((plant) => (
            <li key={plant.slug}>
              <PlantCard plant={plant} locale={locale} />
            </li>
          ))}
        </PlantGrid>
      ) : (
        <p className="text-muted">{t("plantCount", { count: 0 })}</p>
      )}
    </div>
  );
}
