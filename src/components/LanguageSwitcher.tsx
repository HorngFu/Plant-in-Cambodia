"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/routing";

/**
 * Links to the same page in the other language. Uses Next's own router hooks rather than
 * next-intl's client navigation, so next-intl stays out of the browser bundle.
 */
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
  const href = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), `/${other}`);

  return (
    <Link
      href={href}
      hrefLang={other}
      lang={other}
      aria-label={ariaLabel}
      className="ml-auto rounded-full border border-border px-3 py-1.5 text-sm font-medium hover:border-accent hover:text-accent sm:ml-0"
    >
      {label}
    </Link>
  );
}
