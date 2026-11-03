import type { Locale } from "@/i18n/routing";
import { LETTERS } from "@/lib/az";
import { LocaleLink as Link } from "./LocaleLink";

/** A–Z letter links; letters without plants are shown but not linked. */
export function LetterNav({
  locale,
  available,
  current,
  label,
}: {
  locale: Locale;
  available: Set<string>;
  current?: string;
  label: string;
}) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-1">
        {LETTERS.map((letter) => (
          <li key={letter}>
            {available.has(letter) ? (
              <Link
                locale={locale}
                href={`/a-z/${letter.toLowerCase()}`}
                aria-current={letter === current ? "page" : undefined}
                className={`flex size-9 items-center justify-center rounded-lg border font-semibold ${
                  letter === current
                    ? "border-accent bg-accent text-surface"
                    : "border-border bg-surface hover:border-accent hover:text-accent"
                }`}
              >
                {letter}
              </Link>
            ) : (
              <span className="flex size-9 items-center justify-center rounded-lg text-muted opacity-50">
                {letter}
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
