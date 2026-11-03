/**
 * Writes build-time data files to public/data/ (git-ignored):
 *   search-index.json   compact plant index for the browser search (src/lib/search.ts)
 *
 *   tsx scripts/build-data.ts [--content <dir>] [--out <dir>]
 *
 * Runs before every `next build` (see package.json) and `next dev`.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { plantSchema, type PlantData } from "../src/lib/content/schema";
import type { IndexEntry, SearchIndex } from "../src/lib/search";

const arg = (name: string, fallback: string) => {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};
const contentDir = arg("--content", "content");
const outDir = arg("--out", join("public", "data"));

/** Last commit date for each plant folder, from one `git log` (empty if history isn't available). */
function lastUpdated(plantsDir: string): Map<string, string> {
  const dates = new Map<string, string>();
  try {
    const shallow = execFileSync("git", ["rev-parse", "--is-shallow-repository"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    if (shallow.trim() === "true") return dates; // one commit for everything: dates would mislead
    const log = execFileSync("git", ["log", "--format=@%cs", "--name-only", "--", plantsDir], {
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
    let date = "";
    for (const line of log.split("\n")) {
      if (line.startsWith("@")) date = line.slice(1);
      else {
        const m = line.match(/plants\/([^/]+)\//);
        if (m && date && !dates.has(m[1])) dates.set(m[1], date); // newest first
      }
    }
  } catch {
    // Not a git checkout: fall back to lastReviewed below.
  }
  return dates;
}

function toEntry(slug: string, d: PlantData, updated?: string): IndexEntry {
  const list = <T>(v: readonly T[]) => (v.length ? [...v] : undefined);
  return {
    s: slug,
    n: d.scientificName,
    a: d.author || undefined,
    k: d.khmerName || undefined,
    kl: d.khmerNameLatin || undefined,
    e: d.englishName || undefined,
    o: list(d.otherLocalNames),
    y: list(d.synonyms),
    f: d.family,
    g: list(d.growthForms),
    r: d.originStatus,
    i: d.iucnStatus,
    p: list(d.provinces),
    h: list(d.habitats),
    u: list(d.uses),
    m: list(d.floweringMonths),
    ph: d.images[0]?.file,
    d: updated ?? d.lastReviewed,
    fp: d.profileLevel === "full" ? 1 : undefined,
  };
}

const plantsDir = join(contentDir, "plants");
const dates = lastUpdated(plantsDir);
const plants: IndexEntry[] = [];
let skipped = 0;

for (const slug of existsSync(plantsDir) ? readdirSync(plantsDir).sort() : []) {
  const file = join(plantsDir, slug, "index.yaml");
  if (!statSync(join(plantsDir, slug)).isDirectory() || !existsSync(file)) continue;
  const parsed = plantSchema.safeParse(parseYaml(readFileSync(file, "utf8")) ?? {});
  if (!parsed.success) {
    skipped++; // `pnpm validate` reports the details
    continue;
  }
  plants.push(toEntry(slug, parsed.data, dates.get(slug)));
}

const index: SearchIndex = { version: 1, generated: new Date().toISOString(), plants };
mkdirSync(outDir, { recursive: true });
const json = JSON.stringify(index);
writeFileSync(join(outDir, "search-index.json"), json);

console.log(
  `search-index.json: ${plants.length} plants, ${(json.length / 1024).toFixed(1)} KiB` +
    (skipped ? ` (${skipped} invalid entries skipped; run pnpm validate)` : "") +
    (dates.size ? "" : " (no git history: 'recently updated' uses lastReviewed)"),
);
