import Link from "next/link";
import type { Locale } from "@/i18n/routing";
import type { IndexEntry } from "@/lib/search";
import { badgeClass, iucnTone, originTone } from "../badge-styles";
import { LeafIcon } from "../icons";

export type CardText = {
  iucn: Record<string, string>;
  origin: Record<string, string>;
};

/** A plant in the search results (rendered on the server for the first page, then in the browser). */
export function ResultCard({
  entry,
  locale,
  familyName,
  text,
  headingLevel = 2,
}: {
  entry: IndexEntry;
  locale: Locale;
  familyName?: string;
  text: CardText;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const common =
    locale === "km" && entry.k
      ? { text: entry.k, lang: "km" }
      : entry.e
        ? { text: entry.e, lang: "en" }
        : entry.k
          ? { text: entry.k, lang: "km" }
          : null;

  return (
    <article className="group relative flex h-full gap-3 rounded-xl border border-border bg-surface p-3 transition-shadow hover:shadow-md">
      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent-soft">
        {entry.ph ? (
          // eslint-disable-next-line @next/next/no-img-element -- pre-optimised static images
          <img src={entry.ph} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <LeafIcon className="size-7 text-accent opacity-40" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Heading className="flex flex-col leading-snug">
          <Link
            href={`/${locale}/plants/${entry.s}`}
            className="font-semibold text-foreground group-hover:text-accent after:absolute after:inset-0"
          >
            {common ? <span lang={common.lang}>{common.text}</span> : <i lang="la">{entry.n}</i>}
          </Link>
          {common && (
            <i lang="la" className="truncate text-sm text-muted">
              {entry.n}
            </i>
          )}
        </Heading>
        {familyName && <p className="text-xs text-muted">{familyName}</p>}
        <div className="mt-auto flex flex-wrap gap-1 pt-1">
          <span className={badgeClass(iucnTone(entry.i))} title={`IUCN: ${text.iucn[entry.i]}`}>
            {entry.i}
            <span className="sr-only"> {text.iucn[entry.i]}</span>
          </span>
          <span className={badgeClass(originTone(entry.r))}>{text.origin[entry.r]}</span>
        </div>
      </div>
    </article>
  );
}
