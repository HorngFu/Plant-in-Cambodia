/**
 * Typed readers over content/. BUILD TIME ONLY: Cloudflare Workers can't read content/ at
 * runtime, so only call these from statically generated pages (generateStaticParams,
 * generateMetadata, static route handlers) and build scripts.
 */
import "server-only";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { cache } from "react";
import {
  createReader,
  type Entry,
  type EntryWithResolvedLinkedFiles,
} from "@keystatic/core/reader";
import keystaticConfig from "../../../keystatic.config";

const contentDir = join(process.cwd(), "content");
const keystaticReader = createReader(process.cwd(), keystaticConfig);

/**
 * On Workers content/ doesn't exist and the Keystatic reader would quietly return nothing,
 * rendering pages with missing data. Fail loudly instead.
 */
function reader() {
  if (!existsSync(contentDir)) {
    throw new Error(
      `content/ not found at ${contentDir}: content can only be read at build time, so this page must be statically generated.`,
    );
  }
  return keystaticReader;
}

type Collections = (typeof keystaticConfig)["collections"];
type WithSlug<T> = T & { slug: string };

export type Plant = WithSlug<EntryWithResolvedLinkedFiles<Collections["plants"]>>;
/** A plant without its long texts loaded: enough for cards and lists. */
export type PlantSummary = WithSlug<Entry<Collections["plants"]>>;
export type Family = WithSlug<Entry<Collections["families"]>>;
export type Province = WithSlug<Entry<Collections["provinces"]>>;
export type Habitat = WithSlug<Entry<Collections["habitats"]>>;
export type Reference = WithSlug<Entry<Collections["references"]>>;
export type Contributor = WithSlug<Entry<Collections["contributors"]>>;
export type Page = WithSlug<EntryWithResolvedLinkedFiles<Collections["pages"]>>;

const withSlug = <T>({ slug, entry }: { slug: string; entry: T }) => ({ slug, ...entry });
const byName = (key: string) => (a: Record<string, unknown>, b: Record<string, unknown>) =>
  String(a[key]).localeCompare(String(b[key]));

/** All plants, sorted by scientific name, without their long texts (fast with thousands). */
export const getPlantList = cache(async (): Promise<PlantSummary[]> => {
  const all = await reader().collections.plants.all();
  return all.map(withSlug).sort(byName("scientificName"));
});

export const getPlant = cache(async (slug: string): Promise<Plant | null> => {
  const entry = await reader().collections.plants.read(slug, { resolveLinkedFiles: true });
  return entry ? { slug, ...entry } : null;
});

export const getFamilies = cache(async (): Promise<Family[]> =>
  (await reader().collections.families.all()).map(withSlug).sort(byName("name")),
);

export const getProvinces = cache(async (): Promise<Province[]> =>
  (await reader().collections.provinces.all())
    .map(withSlug)
    .sort((a, b) => Number(a.isoCode.slice(3)) - Number(b.isoCode.slice(3))),
);

export const getHabitats = cache(async (): Promise<Habitat[]> =>
  (await reader().collections.habitats.all()).map(withSlug).sort(byName("name")),
);

export const getReferences = cache(async (): Promise<Reference[]> =>
  (await reader().collections.references.all()).map(withSlug).sort(byName("shortCitation")),
);

export const getContributors = cache(async (): Promise<Contributor[]> =>
  (await reader().collections.contributors.all()).map(withSlug).sort(byName("name")),
);

export const getPage = cache(async (slug: string): Promise<Page | null> => {
  const entry = await reader().collections.pages.read(slug, { resolveLinkedFiles: true });
  return entry ? { slug, ...entry } : null;
});

export const getPageSlugs = cache(async (): Promise<string[]> => reader().collections.pages.list());

/** Plants in a family, province or habitat. */
export async function getPlantsBy(
  field: "family" | "provinces" | "habitats",
  slug: string,
): Promise<PlantSummary[]> {
  const plants = await getPlantList();
  return plants.filter((p) =>
    field === "family" ? p.family === slug : (p[field] as readonly string[]).includes(slug),
  );
}

/** Lookup tables for showing related entries' names without extra reads. */
export async function getLookups() {
  const [families, provinces, habitats, references, contributors] = await Promise.all([
    getFamilies(),
    getProvinces(),
    getHabitats(),
    getReferences(),
    getContributors(),
  ]);
  const index = <T extends { slug: string }>(items: T[]) => new Map(items.map((i) => [i.slug, i]));
  return {
    families: index(families),
    provinces: index(provinces),
    habitats: index(habitats),
    references: index(references),
    contributors: index(contributors),
  };
}
