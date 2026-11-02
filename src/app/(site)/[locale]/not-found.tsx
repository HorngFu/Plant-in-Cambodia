import { useLocale, useTranslations } from "next-intl";
import { LocaleLink as Link } from "@/components/LocaleLink";

export default function NotFound() {
  const t = useTranslations("notFound");
  const locale = useLocale();
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-4 px-4 py-20">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="text-muted">{t("text")}</p>
      <Link locale={locale} href="/" className="font-medium text-accent hover:underline">
        {t("home")} →
      </Link>
    </div>
  );
}
