import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocaleLink as Link } from "@/components/LocaleLink";
import type { Locale } from "@/i18n/routing";
import { getFamilies, getPlants } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/families">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "families" });
  return pageMetadata({
    locale,
    path: "/families",
    title: t("title"),
    description: t("description"),
  });
}

export default async function FamiliesPage({ params }: PageProps<"/[locale]/families">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "families" });
  const [families, plants] = await Promise.all([getFamilies(), getPlants()]);
  const counts = new Map<string, number>();
  for (const p of plants) counts.set(p.family, (counts.get(p.family) ?? 0) + 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">{t("title")}</h1>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {families.map((f) => {
          const count = counts.get(f.slug) ?? 0;
          return (
            <li key={f.slug}>
              <Link
                locale={locale}
                href={`/families/${f.slug}`}
                className="flex h-full flex-col rounded-xl border border-border bg-surface p-4 hover:border-accent"
              >
                <span className="font-semibold">{f.name}</span>
                {(f.englishName || f.khmerName) && (
                  <span className="text-sm text-muted">
                    {locale === "km" && f.khmerName ? (
                      <span lang="km">{f.khmerName}</span>
                    ) : (
                      <span lang="en">{f.englishName}</span>
                    )}
                  </span>
                )}
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
