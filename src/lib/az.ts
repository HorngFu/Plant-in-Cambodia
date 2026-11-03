import type { IndexEntry } from "./search";

export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** Letter for A–Z browsing: the genus initial (a leading hybrid sign is ignored). */
export const letterOf = (scientificName: string) =>
  scientificName
    .replace(/^[×x]\s+/, "")
    .charAt(0)
    .toUpperCase();

export function groupByLetter(plants: IndexEntry[]): Map<string, IndexEntry[]> {
  const groups = new Map<string, IndexEntry[]>();
  for (const p of [...plants].sort((a, b) => a.n.localeCompare(b.n))) {
    const letter = letterOf(p.n);
    groups.set(letter, [...(groups.get(letter) ?? []), p]);
  }
  return groups;
}
