import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { REPO_URL } from "@/lib/site";

export async function SiteFooter({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const nav = await getTranslations({ locale, namespace: "nav" });

  return (
    <footer className="mt-16 border-t border-border bg-surface text-sm text-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8">
        <p className="rounded-md bg-warn-bg px-3 py-2 text-warn-fg">{t("draft")}</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li>
            <Link href="/about" className="hover:text-foreground hover:underline">
              {nav("about")}
            </Link>
          </li>
          <li>
            <Link href="/contribute" className="hover:text-foreground hover:underline">
              {nav("contribute")}
            </Link>
          </li>
          <li>
            <Link href="/license" className="hover:text-foreground hover:underline">
              {nav("license")}
            </Link>
          </li>
          <li>
            <a href={REPO_URL} className="hover:text-foreground hover:underline">
              {t("source")}
            </a>
          </li>
        </ul>
        <p>{t("license")}</p>
      </div>
    </footer>
  );
}
