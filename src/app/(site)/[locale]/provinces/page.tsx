import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getPlants, getProvinces } from "@/lib/content";
import { placeName } from "@/lib/localize";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/provinces">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "provinces" });
  return pageMetadata({
    locale,
    path: "/provinces",
    title: t("title"),
    description: t("description"),
  });
}

export default async function ProvincesPage({ params }: PageProps<"/[locale]/provinces">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "provinces" });
  const [provinces, plants] = await Promise.all([getProvinces(), getPlants()]);
  const counts = new Map<string, number>();
  for (const p of plants)
    for (const slug of p.provinces) counts.set(slug, (counts.get(slug) ?? 0) + 1);

  // Alphabetical in the page's language.
  const sorted = [...provinces].sort((a, b) =>
    placeName(a, locale).text.localeCompare(placeName(b, locale).text, locale),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="mt-1 mb-8 max-w-2xl text-muted">{t("description")}</p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((p) => {
          const name = placeName(p, locale);
          const other = locale === "km" ? p.name : p.khmerName;
          const count = counts.get(p.slug) ?? 0;
          return (
            <li key={p.slug}>
              <Link
                href={`/provinces/${p.slug}`}
                className="flex h-full flex-col rounded-xl border border-border bg-surface p-4 hover:border-accent"
              >
                <span lang={name.lang} className="font-semibold">
                  {name.text}
                </span>
                <span lang={locale === "km" ? "en" : "km"} className="text-sm text-muted">
                  {other}
                </span>
                <span className={`mt-2 text-sm ${count ? "text-accent" : "text-muted"}`}>
                  {t("plantCount", { count })}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
