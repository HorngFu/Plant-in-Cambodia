import Markdoc, { type Node } from "@markdoc/markdoc";
import React from "react";
import type { Locale } from "@/i18n/routing";

type Doc = { node: Node } | undefined;

export function hasText(doc: Doc): boolean {
  return Boolean(doc?.node.children.length);
}

/** The document in the page's language, or the other language if it hasn't been written yet. */
export function pickDoc(
  value: { readonly km: Doc; readonly en: Doc } | undefined,
  locale: Locale,
): { node: Node; lang: Locale; isFallback: boolean } | null {
  const other: Locale = locale === "km" ? "en" : "km";
  if (value && hasText(value[locale]))
    return { node: value[locale]!.node, lang: locale, isFallback: false };
  if (value && hasText(value[other]))
    return { node: value[other]!.node, lang: other, isFallback: true };
  return null;
}

/** Rich text written in Keystatic, rendered at build time. */
export function MarkdocContent({ node, lang }: { node: Node; lang: Locale }) {
  const content = Markdoc.transform(node);
  return (
    <div lang={lang} className="prose">
      {Markdoc.renderers.react(content, React)}
    </div>
  );
}
