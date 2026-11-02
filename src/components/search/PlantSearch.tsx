"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useDeferredValue, useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/routing";
import {
  FACETS,
  parseState,
  prepare,
  run,
  serializeState,
  type Facet,
  type IndexEntry,
  type Prepared,
  type SearchIndex,
  type SearchState,
  type Sort,
} from "@/lib/search";
import { ResultCard, type CardText } from "./ResultCard";

const PAGE_SIZE = 48;
/** Facets with many options use a dropdown (one value); the rest use checkboxes. */
const SELECT_FACETS: Facet[] = ["family", "province", "habitat"];

export type Option = { value: string; label: string; lang?: string };

export type SearchText = CardText & {
  searchLabel: string;
  searchPlaceholder: string;
  /** "{n}" is replaced by the number. */
  results: { zero: string; one: string; other: string };
  noResults: string;
  noResultsHint: string;
  loading: string;
  filters: string;
  clearAll: string;
  showMore: string;
  sortLabel: string;
  sort: Record<Sort, string>;
  facet: Record<Facet, string>;
  any: string;
  photos: string;
  removeFilter: string;
};

type Props = {
  locale: Locale;
  /** First page, sorted by scientific name: shown before the index loads and without JavaScript. */
  initial: IndexEntry[];
  total: number;
  options: Record<Facet, Option[]>;
  familyNames: Record<string, string>;
  text: SearchText;
};

export function PlantSearch(props: Props) {
  return (
    <Suspense fallback={<StaticView {...props} />}>
      <SearchApp {...props} />
    </Suspense>
  );
}

// The index is fetched once per page load and shared.
let indexPromise: Promise<IndexEntry[]> | null = null;
const loadIndex = () =>
  (indexPromise ??= fetch("/data/search-index.json")
    .then((r) => {
      if (!r.ok) throw new Error(`search index: HTTP ${r.status}`);
      return r.json() as Promise<SearchIndex>;
    })
    .then((i) => i.plants));

function SearchApp({ locale, initial, total, options, familyNames, text }: Props) {
  const params = useSearchParams();
  const [state, setState] = useState<SearchState>(() => parseState(params));
  const [prepared, setPrepared] = useState<Prepared[] | null>(null);
  const [error, setError] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    let live = true;
    loadIndex().then(
      (plants) => live && setPrepared(prepare(plants, familyNames)),
      () => live && setError(true),
    );
    return () => {
      live = false;
    };
  }, [familyNames]);

  // Keep the URL in step so results can be shared.
  const qs = serializeState(state);
  useEffect(() => {
    const url = qs ? `?${qs}` : window.location.pathname;
    if (url !== `${window.location.search || window.location.pathname}`) {
      window.history.replaceState(null, "", url);
    }
  }, [qs]);

  const deferred = useDeferredValue(state);
  const results = useMemo(() => (prepared ? run(prepared, deferred) : null), [prepared, deferred]);

  const update = (patch: Partial<SearchState>) => setState((s) => ({ ...s, ...patch }));
  const setFacet = (facet: Facet, values: string[]) =>
    setState((s) => ({ ...s, filters: { ...s.filters, [facet]: values } }));
  const isEmpty = qs === "" || qs === "sort=name";

  const active = [
    ...FACETS.flatMap((facet) =>
      (state.filters[facet] ?? []).map((value) => ({
        key: `${facet}:${value}`,
        label: options[facet].find((o) => o.value === value)?.label ?? value,
        remove: () =>
          setFacet(
            facet,
            (state.filters[facet] ?? []).filter((v) => v !== value),
          ),
      })),
    ),
    ...(state.photos
      ? [{ key: "photos", label: text.photos, remove: () => update({ photos: false }) }]
      : []),
  ];

  const count = (facet: Facet, value: string) => results?.counts[facet].get(value) ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <SearchBox text={text} value={state.q} onChange={(q) => update({ q })} />
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {text.sortLabel}
          <select
            value={state.sort}
            onChange={(e) => update({ sort: e.target.value as Sort })}
            className="rounded-full border border-border bg-surface px-4 py-2.5 font-normal"
          >
            {(["relevance", "name", "khmer", "updated"] as const).map((s) => (
              <option key={s} value={s}>
                {text.sort[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="rounded-xl border border-border bg-surface lg:border-0 lg:bg-transparent">
          {/* Collapsed on phones so results come first; always open on wide screens. */}
          <button
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="plant-filters"
            onClick={() => setFiltersOpen((o) => !o)}
            className="flex w-full items-center justify-between px-4 py-3 font-semibold lg:hidden"
          >
            <span>
              {text.filters}
              {active.length > 0 && ` (${active.length})`}
            </span>
            <span aria-hidden="true">{filtersOpen ? "−" : "+"}</span>
          </button>
          <div
            id="plant-filters"
            className={`${filtersOpen ? "flex" : "hidden"} flex-col gap-5 px-4 pb-4 lg:flex lg:p-0`}
          >
            {FACETS.map((facet) =>
              SELECT_FACETS.includes(facet) ? (
                <label key={facet} className="flex flex-col gap-1.5 text-sm font-medium">
                  {text.facet[facet]}
                  <select
                    value={state.filters[facet]?.[0] ?? ""}
                    onChange={(e) => setFacet(facet, e.target.value ? [e.target.value] : [])}
                    className="rounded-lg border border-border bg-surface px-3 py-2 font-normal"
                  >
                    <option value="">{text.any}</option>
                    {options[facet].map((o) => (
                      <option key={o.value} value={o.value} lang={o.lang}>
                        {o.label}
                        {results ? ` (${count(facet, o.value)})` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <fieldset key={facet} className="flex flex-col gap-1">
                  <legend className="mb-1 text-sm font-medium">{text.facet[facet]}</legend>
                  {options[facet].map((o) => {
                    const checked = state.filters[facet]?.includes(o.value) ?? false;
                    const n = count(facet, o.value);
                    return (
                      <label
                        key={o.value}
                        className={`flex items-center gap-2 text-sm ${results && n === 0 && !checked ? "text-muted" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const current = state.filters[facet] ?? [];
                            setFacet(
                              facet,
                              e.target.checked
                                ? [...current, o.value]
                                : current.filter((v) => v !== o.value),
                            );
                          }}
                          className="size-4 accent-[var(--accent)]"
                        />
                        <span lang={o.lang}>{o.label}</span>
                        {results && <span className="ml-auto text-xs text-muted">{n}</span>}
                      </label>
                    );
                  })}
                </fieldset>
              ),
            )}
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={state.photos}
                onChange={(e) => update({ photos: e.target.checked })}
                className="size-4 accent-[var(--accent)]"
              />
              {text.photos}
              {results && (
                <span className="ml-auto text-xs font-normal text-muted">
                  {results.counts.photos.get("1") ?? 0}
                </span>
              )}
            </label>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <p aria-live="polite" className="mr-2 font-medium">
              {results
                ? formatCount(text.results, results.items.length)
                : isEmpty
                  ? formatCount(text.results, total)
                  : error
                    ? ""
                    : text.loading}
            </p>
            {active.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={f.remove}
                aria-label={text.removeFilter.replace("{label}", f.label)}
                className="rounded-full bg-accent-soft px-3 py-1 text-sm text-accent-strong hover:bg-border"
              >
                {f.label} ×
              </button>
            ))}
            {active.length > 0 && (
              <button
                type="button"
                onClick={() => update({ filters: {}, photos: false })}
                className="text-sm text-accent underline underline-offset-2"
              >
                {text.clearAll}
              </button>
            )}
          </div>

          {results ? (
            results.items.length > 0 ? (
              <ResultList
                key={qs}
                items={results.items.map((p) => p.entry)}
                locale={locale}
                familyNames={familyNames}
                text={text}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <p className="font-medium">{text.noResults}</p>
                <p className="text-sm text-muted">{text.noResultsHint}</p>
              </div>
            )
          ) : (
            (isEmpty || error) && (
              <Grid entries={initial} locale={locale} familyNames={familyNames} text={text} />
            )
          )}
        </div>
      </div>
    </div>
  );
}

function ResultList({
  items,
  ...rest
}: {
  items: IndexEntry[];
  locale: Locale;
  familyNames: Record<string, string>;
  text: SearchText;
}) {
  // Remounted (key) whenever the search changes, so paging starts again from the top.
  const [limit, setLimit] = useState(PAGE_SIZE);
  return (
    <>
      <Grid entries={items.slice(0, limit)} {...rest} />
      {items.length > limit && (
        <button
          type="button"
          onClick={() => setLimit((l) => l + PAGE_SIZE)}
          className="self-center rounded-full border border-accent px-6 py-2 font-medium text-accent hover:bg-accent-soft"
        >
          {rest.text.showMore} ({items.length - limit})
        </button>
      )}
    </>
  );
}

function Grid({
  entries,
  locale,
  familyNames,
  text,
}: {
  entries: IndexEntry[];
  locale: Locale;
  familyNames: Record<string, string>;
  text: SearchText;
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {entries.map((e) => (
        <li key={e.s}>
          <ResultCard entry={e} locale={locale} familyName={familyNames[e.f]} text={text} />
        </li>
      ))}
    </ul>
  );
}

function SearchBox({
  text,
  value,
  onChange,
  disabled,
}: {
  text: SearchText;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div role="search" className="flex flex-1 flex-col gap-1.5">
      <label htmlFor="plant-search" className="text-sm font-medium">
        {text.searchLabel}
      </label>
      <input
        id="plant-search"
        type="search"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={text.searchPlaceholder}
        autoComplete="off"
        className="rounded-full border border-border bg-surface px-5 py-2.5 text-base placeholder:text-muted"
      />
    </div>
  );
}

/** Server-rendered view: the first page by name, until the browser takes over. */
function StaticView({ locale, initial, total, familyNames, text }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <SearchBox text={text} value="" disabled />
      <p className="font-medium">{formatCount(text.results, total)}</p>
      <Grid entries={initial} locale={locale} familyNames={familyNames} text={text} />
    </div>
  );
}

function formatCount(t: SearchText["results"], n: number) {
  const template = n === 0 ? t.zero : n === 1 ? t.one : t.other;
  return template.replace("{n}", n.toLocaleString("en"));
}
