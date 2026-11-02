import type { Locale } from "@/i18n/routing";

/** Sends the query to the plants list (?q=), which filters in the browser. Full search: Phase 4. */
export function SearchForm({
  locale,
  label,
  placeholder,
  button,
}: {
  locale: Locale;
  label: string;
  placeholder: string;
  button: string;
}) {
  return (
    <form action={`/${locale}/plants`} method="get" role="search" className="flex max-w-xl gap-2">
      <label htmlFor="home-search" className="sr-only">
        {label}
      </label>
      <input
        id="home-search"
        name="q"
        type="search"
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-full border border-border bg-surface px-5 py-3 text-base placeholder:text-muted"
      />
      <button
        type="submit"
        className="rounded-full bg-accent px-6 py-3 font-semibold text-surface hover:bg-accent-strong"
      >
        {button}
      </button>
    </form>
  );
}
