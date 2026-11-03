import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  editDistance,
  emptyState,
  parseState,
  prepare,
  run,
  serializeState,
  type IndexEntry,
  type SearchState,
} from "../src/lib/search";
import { fakePlants } from "./lib/fake-plants";

// The real index, built from content/ by `pnpm data` (run by `pnpm test`).
const index = JSON.parse(readFileSync("public/data/search-index.json", "utf8")) as {
  plants: IndexEntry[];
};
const prepared = prepare(index.plants, { fabaceae: "Fabaceae", lythraceae: "Lythraceae" });
const search = (q: string, extra: Partial<SearchState> = {}) =>
  run(prepared, { ...emptyState, ...extra, q }).items.map((p) => p.entry.s);

test("Khmer, romanised and scientific names find the same plant", () => {
  for (const q of ["ស្រឡៅ", "sralao", "Lagerstroemia"]) {
    assert.equal(search(q)[0], "lagerstroemia-calyculata", q);
  }
});

test("Latin search tolerates typos, accents, case and partial words", () => {
  for (const q of [
    "Lagerstromia",
    "lagerströemia",
    "LAGERSTROEMIA CALYCULATA",
    "lagerst",
    "calycul",
  ]) {
    assert.equal(search(q)[0], "lagerstroemia-calyculata", q);
  }
  assert.equal(search("sacred lotus")[0], "nelumbo-nucifera");
  assert.equal(search("rosewod")[0], "dalbergia-cochinchinensis"); // typo in the English name
  assert.deepEqual(search("zzzzqqq"), []);
});

test("Khmer search matches inside names and ignores zero-width spaces", () => {
  assert.equal(search("ឡៅ")[0], "lagerstroemia-calyculata"); // substring
  const zwsp = String.fromCharCode(0x200b);
  assert.equal(search(`ស្រ${zwsp}ឡៅ`)[0], "lagerstroemia-calyculata");
  assert.equal(search("ឈូក")[0], "nelumbo-nucifera");
});

test("search by family name", () => {
  const results = search("fabaceae");
  assert.ok(results.includes("afzelia-xylocarpa") && results.includes("tamarindus-indica"));
});

test("combined filters: OR within a facet, AND across facets", () => {
  const state = (filters: SearchState["filters"]) => ({ ...emptyState, filters });
  const timber = run(prepared, state({ use: ["timber"] })).items.map((p) => p.entry.s);
  const timberVu = run(prepared, state({ use: ["timber"], iucn: ["VU"] })).items.map(
    (p) => p.entry.s,
  );
  const vuOrEn = run(prepared, state({ iucn: ["VU", "EN"] })).items.map((p) => p.entry.s);

  assert.ok(timberVu.length > 0 && timberVu.length < timber.length);
  assert.ok(timberVu.every((s) => timber.includes(s)));
  assert.ok(vuOrEn.includes("afzelia-xylocarpa")); // EN
  assert.ok(vuOrEn.includes("hopea-odorata")); // VU
  assert.deepEqual(
    run(prepared, state({ province: ["siem-reap"], growth: ["palm"] })).items.map((p) => p.entry.s),
    ["borassus-flabellifer"],
  );
});

test("facet counts reflect the other active filters", () => {
  const { counts } = run(prepared, { ...emptyState, filters: { growth: ["palm"] } });
  assert.equal(counts.iucn.get("NE"), 1); // the sugar palm only
  assert.equal(counts.growth.get("tree"), 8); // the growth facet ignores its own selection
});

test("search state round-trips through a shareable URL", () => {
  const state: SearchState = {
    q: "tree",
    filters: { use: ["timber", "food"], province: ["siem-reap"], month: ["4"] },
    photos: true,
    sort: "updated",
  };
  const qs = serializeState(state);
  assert.equal(qs, "q=tree&province=siem-reap&use=food%2Ctimber&month=4&photos=1&sort=updated");
  const back = parseState(new URLSearchParams(qs));
  assert.deepEqual(back, { ...state, filters: { ...state.filters, use: ["food", "timber"] } });
  assert.equal(serializeState(emptyState), "");
});

test("sorting by name, Khmer name and last update", () => {
  const byName = search("", { sort: "name" });
  assert.deepEqual(byName, [...byName].sort());
  const byKhmer = run(prepared, { ...emptyState, sort: "khmer" }).items;
  assert.ok(byKhmer.every((p) => p.entry.k)); // all sample plants have Khmer names
  assert.equal(search("", { sort: "updated" }).length, index.plants.length);
});

test("edit distance with transpositions", () => {
  assert.equal(editDistance("lagerstroemia", "lagerstromia", 2), 1);
  assert.equal(editDistance("hopea", "hoepa", 1), 1);
  assert.equal(editDistance("abc", "xyz", 1), 2); // gave up past the limit
});

test("stays fast with 5,000 plants", () => {
  const plants = fakePlants(5000, {
    families: ["fabaceae", "lythraceae", "poaceae", "orchidaceae", "rubiaceae"],
    provinces: ["siem-reap", "kampot", "koh-kong", "mondulkiri", "pursat"],
    habitats: ["mangrove", "evergreen-forest", "towns-and-gardens"],
  });
  plants.push(...index.plants); // the real Sralao must still be found among them

  const t0 = performance.now();
  const big = prepare(plants);
  const prepareMs = performance.now() - t0;

  const queries = [
    "ស្រឡៅ",
    "sralao",
    "Lagerstroemia",
    "kalo",
    "tree",
    "ក",
    "lagerstromia cal",
    "zzz",
  ];
  const timings: number[] = [];
  for (const q of queries) {
    const t = performance.now();
    const r = run(big, { ...emptyState, q, filters: { iucn: ["LC", "VU"] } });
    timings.push(performance.now() - t);
    if (["ស្រឡៅ", "sralao", "Lagerstroemia"].includes(q)) {
      assert.equal(run(big, { ...emptyState, q }).items[0].entry.s, "lagerstroemia-calyculata", q);
    }
    assert.ok(r.items.length <= plants.length);
  }
  const worst = Math.max(...timings);
  const median = [...timings].sort((a, b) => a - b)[Math.floor(timings.length / 2)];
  console.log(
    `  5,010 plants: prepare ${prepareMs.toFixed(0)} ms; search median ${median.toFixed(1)} ms, worst ${worst.toFixed(1)} ms`,
  );
  // Generous limits so slow CI machines pass; typical numbers are far lower.
  assert.ok(prepareMs < 1000, `prepare took ${prepareMs} ms`);
  assert.ok(worst < 150, `slowest search took ${worst} ms`);
});
