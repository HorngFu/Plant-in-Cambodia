import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MarkdocContent, pickDoc } from "@/components/MarkdocContent";
import type { Locale } from "@/i18n/routing";
import { getPage, getPageSlugs } from "@/lib/content";
import { pageMetadata, truncate } from "@/lib/metadata";

type Props = PageProps<"/[locale]/[page]">;

// About, License, Contribute... from the `pages` collection.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPageSlugs()).map((page) => ({ page }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: l, page: slug } = await params;
  const locale = l as Locale;
  const page = await getPage(slug);
  if (!page) return {};
  const site = await getTranslations({ locale, namespace: "site" });
  const body = pickDoc(page.body, locale);
  const firstParagraph = body?.node.children.find((n) => n.type === "paragraph");
  const text = firstParagraph ? plainText(firstParagraph) : "";
  return pageMetadata({
    locale,
    path: `/${slug}`,
    title: locale === "km" ? page.titleKm : page.title,
    description: truncate(text || site("description")),
  });
}

export default async function InfoPage({ params }: Props) {
  const { locale: l, page: slug } = await params;
  const locale = l as Locale;
  setRequestLocale(locale);
  const page = await getPage(slug);
  if (!page) notFound();

  const t = await getTranslations({ locale, namespace: "plant" });
  const body = pickDoc(page.body, locale);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">{locale === "km" ? page.titleKm : page.title}</h1>
      {body && (
        <>
          {body.isFallback && locale === "km" && (
            <p className="mb-4 text-sm text-muted">{t("notTranslated")}</p>
          )}
          <MarkdocContent node={body.node} lang={body.lang} />
        </>
      )}
    </article>
  );
}

function plainText(node: {
  type: string;
  attributes: Record<string, unknown>;
  children: unknown[];
}): string {
  if (node.type === "text") return String(node.attributes.content ?? "");
  return (node.children as (typeof node)[]).map(plainText).join("");
}
