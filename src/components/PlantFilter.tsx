"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react";

// Strips Latin accents only (U+0300–U+036F); a broader "diacritic" class would remove Khmer vowel signs.
const LATIN_ACCENTS = new RegExp(
  `[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`,
  "g",
);
const normalize = (s: string) => s.normalize("NFD").replace(LATIN_ACCENTS, "").toLowerCase().trim();

type Item = { slug: string; text: string };
type Labels = { label: string; placeholder: string; noResults: string; showing: string };

/**
 * Filters the server-rendered plant cards (each `<li data-slug>`) by name.
 * A stopgap for small lists; Phase 4 replaces it with a real search index.
 */
export function PlantFilter({
  items,
  children,
  ...labels
}: Labels & { items: Item[]; children: React.ReactNode }) {
  const listRef = useRef<HTMLDivElement>(null);
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<Field labels={labels} value="" disabled />}>
        <FilterControls items={items} listRef={listRef} labels={labels} />
      </Suspense>
      <div ref={listRef}>{children}</div>
    </div>
  );
}

function FilterControls({
  items,
  listRef,
  labels,
}: {
  items: Item[];
  listRef: RefObject<HTMLDivElement | null>;
  labels: Labels;
}) {
  // Start from ?q= (the home page search box links here).
  const params = useSearchParams();
  const [query, setQuery] = useState(() => params.get("q") ?? "");
  const q = normalize(query);

  const visible = useMemo(
    () => new Set(items.filter((i) => !q || normalize(i.text).includes(q)).map((i) => i.slug)),
    [items, q],
  );

  useEffect(() => {
    listRef.current?.querySelectorAll<HTMLElement>("[data-slug]").forEach((el) => {
      el.hidden = !visible.has(el.dataset.slug ?? "");
    });
    const url = new URL(window.location.href);
    if (q) url.searchParams.set("q", query);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  }, [visible, q, query, listRef]);

  const status = !q
    ? ""
    : visible.size === 0
      ? labels.noResults.replace("{query}", query)
      : labels.showing
          .replace("{shown}", String(visible.size))
          .replace("{total}", String(items.length));

  return <Field labels={labels} value={query} onChange={setQuery} status={status} />;
}

function Field({
  labels,
  value,
  onChange,
  status = "",
  disabled,
}: {
  labels: Labels;
  value: string;
  onChange?: (value: string) => void;
  status?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex max-w-xl flex-col gap-1.5">
      <label htmlFor="plant-filter" className="text-sm font-medium">
        {labels.label}
      </label>
      <input
        id="plant-filter"
        type="search"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={labels.placeholder}
        className="rounded-full border border-border bg-surface px-5 py-2.5 placeholder:text-muted"
      />
      <p aria-live="polite" className="min-h-5 text-sm text-muted">
        {status}
      </p>
    </div>
  );
}
