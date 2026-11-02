import NextLink from "next/link";
import type { ComponentProps } from "react";
import type { Locale } from "@/i18n/routing";

type Props = Omit<ComponentProps<typeof NextLink>, "href"> & { href: string; locale: Locale };

/** next/link with the locale prefix, e.g. href="/plants" → "/km/plants". Server-side, no i18n JS. */
export function LocaleLink({ href, locale, ...rest }: Props) {
  return <NextLink href={`/${locale}${href === "/" ? "" : href}`} {...rest} />;
}
