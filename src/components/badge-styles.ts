import { THREATENED_IUCN } from "@/lib/content/vocab";

/** Shared by the server badges (Badge.tsx) and the browser-rendered search results. */
export type Tone = "danger" | "warn" | "ok" | "neutral" | "info";

export const toneClass: Record<Tone, string> = {
  danger: "bg-danger-bg text-danger-fg",
  warn: "bg-warn-bg text-warn-fg",
  ok: "bg-ok-bg text-ok-fg",
  neutral: "bg-neutral-bg text-neutral-fg",
  info: "bg-info-bg text-info-fg",
};

export const badgeClass = (tone: Tone) =>
  `inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClass[tone]}`;

export function iucnTone(status: string): Tone {
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

export const originTone = (status: string): Tone =>
  status === "invasive" ? "warn" : status === "endemic" ? "ok" : "info";
