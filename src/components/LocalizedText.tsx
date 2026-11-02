import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { Localized } from "@/lib/localize";

/**
 * Renders text with the right `lang` attribute. If it fell back to the other language,
 * says so, so Khmer readers know a translation is still missing.
 */
export async function LocalizedText({
  value,
  locale,
  as: Tag = "p",
  className,
}: {
  value: Localized;
  locale: Locale;
  as?: "p" | "div" | "span";
  className?: string;
}) {
  const t = await getTranslations({ locale, namespace: "plant" });
  return (
    <Tag className={className}>
      <span lang={value.lang}>{value.text}</span>
      {value.isFallback && locale === "km" && (
        <span className="ml-2 text-xs text-muted">({t("notTranslated")})</span>
      )}
    </Tag>
  );
}
