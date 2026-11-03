import "server-only";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cache } from "react";
import type { SearchIndex } from "./search";

const file = join(process.cwd(), "public", "data", "search-index.json");

/** The search index written by scripts/build-data.ts. Build time only, like the content readers. */
export const getSearchIndex = cache((): SearchIndex => {
  if (!existsSync(file)) {
    throw new Error(
      `${file} is missing: run \`pnpm data\` (pnpm dev and pnpm build do this for you).`,
    );
  }
  return JSON.parse(readFileSync(file, "utf8")) as SearchIndex;
});
