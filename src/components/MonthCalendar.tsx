import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { MONTHS } from "@/lib/content/vocab";

/** Twelve-month grid showing when a plant flowers and fruits. */
export async function MonthCalendar({
  flowering,
  fruiting,
  locale,
}: {
  flowering: readonly string[];
  fruiting: readonly string[];
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "plant" });
  const months = await getTranslations({ locale, namespace: "vocab" });

  if (flowering.length === 0 && fruiting.length === 0) {
    return <p className="text-muted">{t("noCalendar")}</p>;
  }

  const rows = [
    { label: t("flowering"), active: flowering, className: "bg-[#d98bb5] dark:bg-[#b5658f]" },
    { label: t("fruiting"), active: fruiting, className: "bg-[#d9a54a] dark:bg-[#b5832b]" },
  ].filter((r) => r.active.length > 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th scope="col" className="sr-only">
              {t("calendar")}
            </th>
            {MONTHS.map((m) => (
              <th key={m.value} scope="col" className="font-medium text-muted">
                <abbr title={months(`month.${m.value}` as "month.1")} className="no-underline">
                  {months(`monthShort.${m.value}` as "monthShort.1")}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row" className="pr-2 text-left font-medium whitespace-nowrap">
                {row.label}
              </th>
              {MONTHS.map((m) => {
                const on = row.active.includes(m.value);
                return (
                  <td key={m.value} className="h-6">
                    <span
                      className={`block h-full rounded ${on ? row.className : "bg-neutral-bg"}`}
                    >
                      <span className="sr-only">
                        {months(`month.${m.value}` as "month.1")}: {on ? "✓" : "–"}
                      </span>
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
