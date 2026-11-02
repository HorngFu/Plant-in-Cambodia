/**
 * Deterministic fake plants for scale tests (Phase 4: "designed and tested for 5,000+ entries").
 * Names are random syllables, not real taxa. Used by search.test.ts and generate-test-plants.ts.
 */
import type { IndexEntry } from "../../src/lib/search";
import {
  GROWTH_FORMS,
  IUCN_STATUSES,
  MONTHS,
  ORIGIN_STATUSES,
  USES,
} from "../../src/lib/content/vocab";

/** Small seeded random generator so every run produces the same data. */
function random(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LATIN = [
  "ka",
  "lo",
  "mi",
  "ra",
  "su",
  "te",
  "vo",
  "ni",
  "pa",
  "do",
  "ge",
  "bu",
  "xi",
  "fe",
  "zu",
];
const ENDINGS = ["ia", "us", "um", "a", "is", "ensis", "ifolia", "oides"];
const KHMER_SYLLABLES = [
  "ក",
  "ខ",
  "គ",
  "ង",
  "ច",
  "ជ",
  "ញ",
  "ដ",
  "ត",
  "ថ",
  "ទ",
  "ន",
  "ប",
  "ផ",
  "ព",
  "ម",
  "យ",
  "រ",
  "ល",
  "វ",
  "ស",
  "ហ",
];
const KHMER_VOWELS = ["ា", "ិ", "ី", "ុ", "ូ", "េ", "ែ", "ោ", "ៅ", ""];

export function fakePlants(
  count: number,
  refs: { families: string[]; provinces: string[]; habitats: string[] },
  seed = 42,
): IndexEntry[] {
  const rnd = random(seed);
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(rnd() * xs.length)];
  const some = <T>(xs: readonly T[], max: number) => {
    const n = Math.floor(rnd() * (max + 1));
    return [...new Set(Array.from({ length: n }, () => pick(xs)))];
  };
  const word = (parts: number) =>
    Array.from({ length: parts }, () => pick(LATIN)).join("") + pick(ENDINGS);
  const khmer = () =>
    Array.from(
      { length: 2 + Math.floor(rnd() * 3) },
      () => pick(KHMER_SYLLABLES) + pick(KHMER_VOWELS),
    ).join("");

  // Unique accepted names first, so synonyms never collide with them (the validator checks both).
  const capitalise = (w: string) => `${w[0].toUpperCase()}${w.slice(1)}`;
  const names = new Set<string>();
  const accepted: { genus: string; name: string }[] = [];
  while (accepted.length < count) {
    const genus = word(2);
    const name = `${capitalise(genus)} ${word(2)}`;
    if (!names.has(name)) {
      names.add(name);
      accepted.push({ genus, name });
    }
  }

  return accepted.map(({ genus, name }, i) => {
    const synonym = `${capitalise(genus)} ${word(2)}`;
    return {
      s: name.toLowerCase().replace(/ /g, "-"),
      n: name,
      a: "Fake",
      k: rnd() < 0.6 ? khmer() : undefined,
      kl: rnd() < 0.5 ? word(1) : undefined,
      e: rnd() < 0.4 ? `${word(1)} tree` : undefined,
      y: rnd() < 0.3 && !names.has(synonym) ? [synonym] : undefined,
      f: pick(refs.families),
      g: some(
        GROWTH_FORMS.map((g) => g.value),
        2,
      ),
      r: pick(ORIGIN_STATUSES).value,
      i: pick(IUCN_STATUSES).value,
      p: some(refs.provinces, 6),
      h: some(refs.habitats, 3),
      u: some(
        USES.map((u) => u.value),
        3,
      ),
      m: some(
        MONTHS.map((m) => m.value),
        4,
      ),
      ph: rnd() < 0.1 ? `/images/plants/fake-${i}.webp` : undefined,
      d: `2026-${String(1 + Math.floor(rnd() * 10)).padStart(2, "0")}-${String(1 + Math.floor(rnd() * 28)).padStart(2, "0")}`,
    };
  });
}
