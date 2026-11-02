/**
 * Plant search: a compact index built at build time (scripts/build-data.ts), and matching,
 * filtering, sorting and URL state used in the browser. No dependencies, so it also runs in tests.
 *
 * Why not a search library: Khmer is written without spaces between words, so word-based
 * tokenizers don't work for it. We match Khmer by substring, and Latin names by word prefix with
 * a small typo allowance. A straight scan of 5,000 entries takes a few milliseconds.
 */

// ---------------------------------------------------------------------------
// Index format (short keys keep public/data/search-index.json small)

export type IndexEntry = {
  /** slug */ s: string;
  /** scientific name */ n: string;
  /** author */ a?: string;
  /** Khmer name */ k?: string;
  /** Khmer name, romanised */ kl?: string;
  /** English name */ e?: string;
  /** other local names */ o?: string[];
  /** synonyms */ y?: string[];
  /** family slug */ f: string;
  /** growth forms */ g?: string[];
  /** origin status */ r: string;
  /** IUCN status */ i: string;
  /** provinces */ p?: string[];
  /** habitats */ h?: string[];
  /** uses */ u?: string[];
  /** flowering months ("1"–"12") */ m?: string[];
  /** first photo path */ ph?: string;
  /** last updated (ISO date) */ d?: string;
  /** full profile */ fp?: 1;
};

export type SearchIndex = { version: 1; generated: string; plants: IndexEntry[] };

// ---------------------------------------------------------------------------
// Normalisation

// Khmer (U+1780–U+17FF) and Khmer symbols (U+19E0–U+19FF).
const KHMER = new RegExp(
  `[${String.fromCharCode(0x1780)}-${String.fromCharCode(0x17ff)}${String.fromCharCode(0x19e0)}-${String.fromCharCode(0x19ff)}]`,
);
const ZERO_WIDTH = new RegExp(`[${String.fromCharCode(0x200b, 0x200c, 0x200d, 0xfeff)}]`, "g");
// Latin accents only (U+0300–U+036F); a broader "diacritic" class would remove Khmer vowel signs.
const LATIN_ACCENTS = new RegExp(
  `[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`,
  "g",
);

export const hasKhmer = (s: string) => KHMER.test(s);

/** Lower case, no accents, punctuation as spaces: "Lagerströemia  Kurz." → "lagerstroemia kurz" */
export function normalizeLatin(s: string): string {
  return s
    .normalize("NFD")
    .replace(LATIN_ACCENTS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Khmer for substring matching: NFC, no zero-width or ordinary spaces (both are optional in Khmer). */
export function normalizeKhmer(s: string): string {
  return s.normalize("NFC").replace(ZERO_WIDTH, "").replace(/\s+/g, "");
}

// ---------------------------------------------------------------------------
// Prepared entries (normalised once when the index loads)

type Field = { tokens: string[]; weight: number };

export type Prepared = {
  entry: IndexEntry;
  latin: Field[];
  khmer: string[];
  sortName: string;
  sortKhmer: string;
};

export function prepare(
  entries: IndexEntry[],
  familyNames: Record<string, string> = {},
): Prepared[] {
  return entries.map((entry) => {
    const latinField = (values: (string | undefined)[], weight: number): Field => ({
      tokens: values
        .flatMap((v) => (v && !hasKhmer(v) ? normalizeLatin(v).split(" ") : []))
        .filter(Boolean),
      weight,
    });
    const others = entry.o ?? [];
    return {
      entry,
      latin: [
        latinField([entry.n], 10),
        latinField([entry.kl, entry.e], 8),
        latinField(entry.y ?? [], 6),
        latinField(others, 6),
        latinField([familyNames[entry.f] ?? entry.f], 2),
      ],
      khmer: [entry.k, ...others]
        .filter((v): v is string => !!v && hasKhmer(v))
        .map(normalizeKhmer),
      sortName: entry.n.toLowerCase(),
      sortKhmer: entry.k ? normalizeKhmer(entry.k) : "",
    };
  });
}

// ---------------------------------------------------------------------------
// Matching

/** Edit distance with transpositions, giving up once it exceeds `max`. */
export function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prevPrev: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, prevPrev[j - 2] + 1);
      }
      cur.push(v);
      rowMin = Math.min(rowMin, v);
    }
    if (rowMin > max) return max + 1;
    prevPrev = prev;
    prev = cur;
  }
  return prev[b.length];
}

const typoAllowance = (length: number) => (length >= 8 ? 2 : length >= 4 ? 1 : 0);

/** How well one query word matches one name word (0 = not at all). */
function wordScore(query: string, word: string): number {
  if (word === query) return 1;
  if (word.startsWith(query)) return 0.8;
  if (query.length >= 3 && word.includes(query)) return 0.5;
  const max = typoAllowance(query.length);
  if (max === 0) return 0;
  // Compare with the word, and with its start when the user is still typing.
  const d = Math.min(
    editDistance(query, word, max),
    word.length > query.length ? editDistance(query, word.slice(0, query.length), max) : max + 1,
  );
  return d <= max ? 0.4 - 0.1 * d : 0;
}

/** Relevance of a plant for a query; 0 if it doesn't match. */
export function score(p: Prepared, query: string): number {
  if (hasKhmer(query)) {
    const q = normalizeKhmer(query);
    if (!q) return 0;
    let best = 0;
    for (const name of p.khmer) {
      if (name === q) best = Math.max(best, 10);
      else if (name.startsWith(q)) best = Math.max(best, 8);
      else if (name.includes(q)) best = Math.max(best, 5);
    }
    return best;
  }

  const words = normalizeLatin(query).split(" ").filter(Boolean);
  if (words.length === 0) return 0;
  let total = 0;
  // Every query word must match some name word (AND); use the best field for each.
  for (const q of words) {
    let best = 0;
    for (const field of p.latin) {
      for (const word of field.tokens) {
        const s = wordScore(q, word);
        if (s > 0) best = Math.max(best, s * field.weight);
      }
    }
    if (best === 0) return 0;
    total += best;
  }
  return total;
}

// ---------------------------------------------------------------------------
// Filters, URL state and sorting

export const FACETS = [
  "family",
  "growth",
  "origin",
  "iucn",
  "province",
  "habitat",
  "use",
  "month",
] as const;
export type Facet = (typeof FACETS)[number];
export type Sort = "relevance" | "name" | "khmer" | "updated";

export type SearchState = {
  q: string;
  filters: Partial<Record<Facet, string[]>>;
  photos: boolean;
  sort: Sort;
};

export const emptyState: SearchState = { q: "", filters: {}, photos: false, sort: "relevance" };

const facetValues = (e: IndexEntry, facet: Facet): string[] => {
  switch (facet) {
    case "family":
      return [e.f];
    case "growth":
      return e.g ?? [];
    case "origin":
      return [e.r];
    case "iucn":
      return [e.i];
    case "province":
      return e.p ?? [];
    case "habitat":
      return e.h ?? [];
    case "use":
      return e.u ?? [];
    case "month":
      return e.m ?? [];
  }
};

/** Within a facet any selected value matches (OR); across facets all must match (AND). */
function passes(e: IndexEntry, state: SearchState, skip?: Facet | "photos"): boolean {
  if (state.photos && skip !== "photos" && !e.ph) return false;
  for (const facet of FACETS) {
    if (facet === skip) continue;
    const selected = state.filters[facet];
    if (!selected?.length) continue;
    const values = facetValues(e, facet);
    if (!selected.some((v) => values.includes(v))) return false;
  }
  return true;
}

export function parseState(params: URLSearchParams): SearchState {
  const filters: SearchState["filters"] = {};
  for (const facet of FACETS) {
    const raw = params.get(facet);
    if (raw) filters[facet] = raw.split(",").filter(Boolean);
  }
  const sort = params.get("sort");
  return {
    q: params.get("q") ?? "",
    filters,
    photos: params.get("photos") === "1",
    sort: sort === "name" || sort === "khmer" || sort === "updated" ? sort : "relevance",
  };
}

/** Query string for a state, without empty values, in a stable order (shareable URLs). */
export function serializeState(state: SearchState): string {
  const params = new URLSearchParams();
  if (state.q.trim()) params.set("q", state.q.trim());
  for (const facet of FACETS) {
    const values = state.filters[facet];
    if (values?.length) params.set(facet, [...values].sort().join(","));
  }
  if (state.photos) params.set("photos", "1");
  if (state.sort !== "relevance") params.set("sort", state.sort);
  return params.toString();
}

export type Results = {
  items: Prepared[];
  /** For each facet value: how many results it would give with the other filters applied. */
  counts: Record<Facet | "photos", Map<string, number>>;
};

export function run(prepared: Prepared[], state: SearchState): Results {
  const q = state.q.trim();
  const scores = new Map<Prepared, number>();
  const matched = q
    ? prepared.filter((p) => {
        const s = score(p, q);
        if (s > 0) scores.set(p, s);
        return s > 0;
      })
    : prepared;

  const counts = Object.fromEntries(
    [...FACETS, "photos" as const].map((f) => [f, new Map<string, number>()]),
  ) as Results["counts"];
  for (const p of matched) {
    for (const facet of FACETS) {
      if (!passes(p.entry, state, facet)) continue;
      const map = counts[facet];
      for (const v of new Set(facetValues(p.entry, facet))) map.set(v, (map.get(v) ?? 0) + 1);
    }
    if (p.entry.ph && passes(p.entry, state, "photos")) {
      counts.photos.set("1", (counts.photos.get("1") ?? 0) + 1);
    }
  }

  const items = matched.filter((p) => passes(p.entry, state));
  const byName = (a: Prepared, b: Prepared) => a.sortName.localeCompare(b.sortName);
  const sort = state.sort === "relevance" && !q ? "name" : state.sort;
  items.sort((a, b) => {
    switch (sort) {
      case "relevance":
        return (scores.get(b) ?? 0) - (scores.get(a) ?? 0) || byName(a, b);
      case "khmer":
        // Plants without a Khmer name go last.
        if (!a.sortKhmer !== !b.sortKhmer) return a.sortKhmer ? -1 : 1;
        return a.sortKhmer.localeCompare(b.sortKhmer, "km") || byName(a, b);
      case "updated":
        return (b.entry.d ?? "").localeCompare(a.entry.d ?? "") || byName(a, b);
      default:
        return byName(a, b);
    }
  });
  return { items, counts };
}
