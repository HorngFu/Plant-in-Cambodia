import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LetterNav } from "@/components/LetterNav";
import { LocaleLink as Link } from "@/components/LocaleLink";
import type { Locale } from "@/i18n/routing";
import { groupByLetter } from "@/lib/az";
import { pageMetadata } from "@/lib/metadata";
import { getSearchIndex } from "@/lib/search-data";

export async function generateMetadata({ params }: PageProps<"/[locale]/a-z">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "az" });
  return pageMetadata({ locale, path: "/a-z", title: t("title"), description: t("description") });
}

export default async function AzPage({ params }: PageProps<"/[locale]/a-z">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "az" });
  const groups = groupByLetter(getSearchIndex().plants);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="mt-1 mb-6 text-muted">{t("description")}</p>
      <LetterNav locale={locale} available={new Set(groups.keys())} label={t("letters")} />
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...groups].map(([letter, plants]) => (
          <li key={letter}>
            <Link
              locale={locale}
              href={`/a-z/${letter.toLowerCase()}`}
              className="flex items-baseline gap-3 rounded-xl border border-border bg-surface p-4 hover:border-accent"
            >
              <span className="text-2xl font-bold text-accent">{letter}</span>
              <span className="text-sm text-muted">
                {t("count", { count: plants.length })} ·{" "}
                <i lang="la">{plants[0].n.split(" ")[0]}</i>
                {plants.length > 1 && (
                  <>
                    {" – "}
                    <i lang="la">{plants[plants.length - 1].n.split(" ")[0]}</i>
                  </>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
