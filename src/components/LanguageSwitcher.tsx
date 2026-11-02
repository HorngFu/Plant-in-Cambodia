"use client";

import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

/** Links to the same page in the other language. */
export function LanguageSwitcher({
  locale,
  label,
  ariaLabel,
}: {
  locale: Locale;
  label: string;
  ariaLabel: string;
}) {
  const pathname = usePathname();
  const other: Locale = locale === "km" ? "en" : "km";

  return (
    <Link
      href={pathname}
      locale={other}
      hrefLang={other}
      lang={other}
      aria-label={ariaLabel}
      className="ml-auto rounded-full border border-border px-3 py-1.5 text-sm font-medium hover:border-accent hover:text-accent sm:ml-0"
    >
      {label}
    </Link>
  );
}
