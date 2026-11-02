import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PlantCard, PlantGrid } from "@/components/PlantCard";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getPlantsBy, getProvinces } from "@/lib/content";
import { placeName } from "@/lib/localize";
import { pageMetadata } from "@/lib/metadata";

type Props = PageProps<"/[locale]/provinces/[slug]">;

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getProvinces()).map((p) => ({ slug: p.slug }));
}

async function getProvince(slug: string) {
  return (await getProvinces()).find((p) => p.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  const province = await getProvince(slug);
  if (!province) return {};
  const t = await getTranslations({ locale, namespace: "provinces" });
  const name = placeName(province, locale).text;
  return pageMetadata({
    locale,
    path: `/provinces/${slug}`,
    title: name,
    description: t("plantsIn", { name }),
  });
}

export default async function ProvincePage({ params }: Props) {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  setRequestLocale(locale);
  const province = await getProvince(slug);
  if (!province) notFound();

  const [t, nav, plants] = await Promise.all([
    getTranslations({ locale, namespace: "provinces" }),
    getTranslations({ locale, namespace: "nav" }),
    getPlantsBy("provinces", slug),
  ]);
  const name = placeName(province, locale);
  const other = locale === "km" ? province.name : province.khmerName;
  const hasSensitive = plants.some((p) => p.isSensitive);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <Link href="/provinces" className="hover:underline">
          {nav("provinces")}
        </Link>
      </nav>
      <header className="mb-8 flex flex-col gap-1 border-b border-border pb-6">
        <h1 lang={name.lang} className="text-3xl font-bold">
          {name.text}
        </h1>
        <p className="text-muted">
          <span lang={locale === "km" ? "en" : "km"}>{other}</span> · {t("isoCode")}{" "}
          {province.isoCode}
        </p>
      </header>
      <h2 className="mb-4 text-xl font-bold">
        {t("plantsIn", { name: name.text })}{" "}
        <span className="font-normal text-muted">({plants.length})</span>
      </h2>
      {hasSensitive && <p className="mb-4 text-sm text-muted">{t("sensitiveNote")}</p>}
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
