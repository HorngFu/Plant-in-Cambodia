import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { badgeClass, iucnTone, originTone, type Tone } from "./badge-styles";

export function Badge({
  tone = "neutral",
  children,
  title,
}: {
  tone?: Tone;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <span title={title} className={badgeClass(tone)}>
      {children}
    </span>
  );
}

export async function IucnBadge({ status, locale }: { status: string; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "vocab.iucn" });
  const label = t(status as "NE");
  return (
    <Badge tone={iucnTone(status)} title={`IUCN: ${label}`}>
      <abbr title={label} className="no-underline">
        {status}
      </abbr>
      <span>{label}</span>
    </Badge>
  );
}

export async function OriginBadge({ status, locale }: { status: string; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "vocab.origin" });
  return <Badge tone={originTone(status)}>{t(status as "native")}</Badge>;
}
