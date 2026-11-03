/**
 * Writes a content folder with N fake plants for scale testing, e.g.:
 *
 *   tsx scripts/generate-test-plants.ts --count 5000 --out ../pic-test-content
 *   tsx scripts/build-data.ts --content ../pic-test-content --out ../pic-test-data
 *
 * Families, provinces, habitats, references and contributors are copied from content/, so
 * `pnpm validate <dir>` passes on the result. Never write into content/ itself.
 */
import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { stringify } from "yaml";
import { fakePlants } from "./lib/fake-plants";

const arg = (name: string, fallback?: string) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : fallback;
};
const count = Number(arg("--count", "5000"));
const out = arg("--out");
if (!out || resolve(out) === resolve("content")) {
  console.error("Usage: tsx scripts/generate-test-plants.ts --count 5000 --out <new folder>");
  process.exit(1);
}

rmSync(out, { recursive: true, force: true });
for (const dir of ["families", "provinces", "habitats", "references", "contributors"]) {
  cpSync(join("content", dir), join(out, dir), { recursive: true });
}

const slugs = (dir: string) => readdirSync(join("content", dir)).map((f) => basename(f, ".yaml"));
const plants = fakePlants(count, {
  families: slugs("families"),
  provinces: slugs("provinces"),
  habitats: slugs("habitats"),
});

for (const p of plants) {
  const dir = join(out, "plants", p.s);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "index.yaml"),
    stringify({
      scientificName: p.n,
      author: p.a,
      family: p.f,
      genus: p.n.split(" ")[0],
      synonyms: p.y ?? [],
      ...(p.k && { khmerName: p.k }),
      ...(p.kl && { khmerNameLatin: p.kl }),
      ...(p.e && { englishName: p.e }),
      growthForms: p.g ?? [],
      originStatus: p.r,
      // Threatened statuses would need isSensitive; keep the fake data valid.
      iucnStatus: ["VU", "EN", "CR"].includes(p.i) ? "NT" : p.i,
      provinces: p.p ?? [],
      habitats: p.h ?? [],
      floweringMonths: p.m ?? [],
      uses: (p.u ?? []).filter((u) => u !== "medicine"),
      profileLevel: "checklist",
    }),
  );
}
console.log(`Wrote ${plants.length} fake plants to ${out}`);
