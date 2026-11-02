import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { THREATENED_IUCN } from "@/lib/content/vocab";

type Tone = "danger" | "warn" | "ok" | "neutral" | "info";

const tones: Record<Tone, string> = {
  danger: "bg-danger-bg text-danger-fg",
  warn: "bg-warn-bg text-warn-fg",
  ok: "bg-ok-bg text-ok-fg",
  neutral: "bg-neutral-bg text-neutral-fg",
  info: "bg-info-bg text-info-fg",
};

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
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function iucnTone(status: string): Tone {
  if (
    (THREATENED_IUCN as readonly string[]).includes(status) ||
    status === "EW" ||
    status === "EX"
  ) {
    return "danger";
  }
  if (status === "NT") return "warn";
  if (status === "LC") return "ok";
  return "neutral";
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
  const tone: Tone = status === "invasive" ? "warn" : status === "endemic" ? "ok" : "info";
  return <Badge tone={tone}>{t(status as "native")}</Badge>;
}
