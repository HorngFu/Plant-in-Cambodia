import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PlantCard, PlantGrid } from "@/components/PlantCard";
import { SearchForm } from "@/components/SearchForm";
import { LocaleLink as Link } from "@/components/LocaleLink";
import type { Locale } from "@/i18n/routing";
import { getFamilies, getPlantList } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "site" });
  return pageMetadata({ locale, path: "", description: t("description") });
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });

  const [plants, families] = await Promise.all([getPlantList(), getFamilies()]);
  const familiesInUse = new Set(plants.map((p) => p.family)).size;
  const photos = plants.reduce((n, p) => n + p.images.length, 0);
  const featured = plants.filter((p) => p.profileLevel === "full").slice(0, 6);

  const stats = [
    { value: plants.length, label: t("statPlants", { count: plants.length }) },
    { value: familiesInUse, label: t("statFamilies", { count: familiesInUse }) },
    { value: photos, label: t("statPhotos", { count: photos }) },
  ];

  return (
    <>
      <section className="border-b border-border bg-accent-soft">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:py-16">
          <h1 className="max-w-3xl text-3xl font-bold text-accent-strong sm:text-4xl">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-lg text-muted">{t("intro")}</p>
          <SearchForm
            locale={locale}
            label={t("searchLabel")}
            placeholder={t("searchPlaceholder")}
            button={t("searchButton")}
          />
          <dl className="flex flex-wrap gap-x-10 gap-y-4 pt-2">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="text-sm text-muted">{s.label}</dt>
                <dd className="text-3xl font-bold text-accent-strong">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-2xl font-bold">{t("featured")}</h2>
          <Link locale={locale} href="/plants" className="font-medium text-accent hover:underline">
            {t("browseAll")} →
          </Link>
        </div>
        <PlantGrid>
          {featured.map((plant) => (
            <li key={plant.slug}>
              <PlantCard plant={plant} locale={locale} />
            </li>
          ))}
        </PlantGrid>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <h2 className="mb-6 text-2xl font-bold">{t("browse")}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <BrowseLink
            locale={locale}
            href="/families"
            title={t("browseFamilies")}
            text={`${t("browseFamiliesText")} (${families.length})`}
          />
          <BrowseLink
            locale={locale}
            href="/provinces"
            title={t("browseProvinces")}
            text={t("browseProvincesText")}
          />
          <BrowseLink
            locale={locale}
            href="/contribute"
            title={t("aboutTitle")}
            text={t("aboutText")}
          />
        </div>
      </section>
    </>
  );
}

function BrowseLink({
  href,
  title,
  text,
  locale,
}: {
  href: string;
  title: string;
  text: string;
  locale: Locale;
}) {
  return (
    <Link
      locale={locale}
      href={href}
      className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-5 hover:border-accent"
    >
      <span className="font-semibold text-accent">{title} →</span>
      <span className="text-sm text-muted">{text}</span>
    </Link>
  );
}
