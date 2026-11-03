import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LetterNav } from "@/components/LetterNav";
import { LocaleLink as Link } from "@/components/LocaleLink";
import type { Locale } from "@/i18n/routing";
import { getFamilies } from "@/lib/content";
import { groupByLetter } from "@/lib/az";
import { pageMetadata } from "@/lib/metadata";
import { getSearchIndex } from "@/lib/search-data";

type Props = PageProps<"/[locale]/a-z/[letter]">;

export const dynamicParams = false;

export function generateStaticParams() {
  return [...groupByLetter(getSearchIndex().plants).keys()].map((l) => ({
    letter: l.toLowerCase(),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: l, letter } = await params;
  const locale = l as Locale;
  const t = await getTranslations({ locale, namespace: "az" });
  return pageMetadata({
    locale,
    path: `/a-z/${letter}`,
    title: t("letterTitle", { letter: letter.toUpperCase() }),
    description: t("description"),
  });
}

export default async function AzLetterPage({ params }: Props) {
  const { locale: l, letter: raw } = await params;
  const locale = l as Locale;
  setRequestLocale(locale);
  const letter = raw.toUpperCase();
  const groups = groupByLetter(getSearchIndex().plants);
  const plants = groups.get(letter);
  if (!plants) notFound();

  const [t, families] = await Promise.all([
    getTranslations({ locale, namespace: "az" }),
    getFamilies(),
  ]);
  const familyName = new Map(families.map((f) => [f.slug, f.name]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <Link locale={locale} href="/a-z" className="hover:underline">
          {t("title")}
        </Link>
      </nav>
      <h1 className="text-3xl font-bold">{t("letterTitle", { letter })}</h1>
      <p className="mt-1 mb-6 text-muted">{t("count", { count: plants.length })}</p>
      <LetterNav
        locale={locale}
        available={new Set(groups.keys())}
        current={letter}
        label={t("letters")}
      />
      <ul className="mt-8 columns-1 gap-8 sm:columns-2 lg:columns-3">
        {plants.map((p) => {
          const common =
            locale === "km" && p.k
              ? { text: p.k, lang: "km" }
              : p.e
                ? { text: p.e, lang: "en" }
                : null;
          return (
            <li key={p.s} className="mb-2 break-inside-avoid">
              <Link locale={locale} href={`/plants/${p.s}`} className="group block">
                <i lang="la" className="font-medium text-accent group-hover:underline">
                  {p.n}
                </i>
                <span className="block text-sm text-muted">
                  {common && <span lang={common.lang}>{common.text} · </span>}
                  {familyName.get(p.f) ?? p.f}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
