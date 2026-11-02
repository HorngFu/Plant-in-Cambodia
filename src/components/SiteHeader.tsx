import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LeafIcon } from "./icons";

export async function SiteHeader({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "nav" });
  const site = await getTranslations({ locale, namespace: "site" });

  const links = [
    { href: "/plants", label: t("plants") },
    { href: "/families", label: t("families") },
    { href: "/provinces", label: t("provinces") },
    { href: "/about", label: t("about") },
  ] as const;

  return (
    <header className="border-b border-border bg-surface">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-surface"
      >
        {t("skip")}
      </a>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-accent-strong">
          <LeafIcon className="size-7 text-accent" />
          <span className="text-lg">{site("name")}</span>
        </Link>
        <nav aria-label={t("menu")} className="order-3 w-full sm:order-none sm:w-auto sm:flex-1">
          <ul className="-mx-2 flex flex-wrap gap-x-1 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded px-2 py-2 text-muted hover:bg-accent-soft hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <LanguageSwitcher
          locale={locale}
          label={t("switchLanguage")}
          ariaLabel={t("switchLanguageLabel")}
        />
      </div>
    </header>
  );
}
