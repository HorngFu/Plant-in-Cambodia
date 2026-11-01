/**
 * Checks every file in content/ before it can be published.
 *
 *   pnpm validate             check the repo's content/
 *   pnpm validate <dir>       check another content directory (used by tests)
 *
 * Errors fail the run (and CI). Warnings are printed but don't fail.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";
import Markdoc from "@markdoc/markdoc";
import { parse as parseYaml } from "yaml";
import type { z } from "zod";
import {
  contributorSchema,
  familySchema,
  habitatSchema,
  pageSchema,
  plantSchema,
  provinceSchema,
  referenceSchema,
  type PlantData,
} from "../src/lib/content/schema";
import { THREATENED_IUCN } from "../src/lib/content/vocab";

const contentDir = process.argv[2] ?? "content";
const publicDir = "public";
const inCI = process.env.GITHUB_ACTIONS === "true";

type Issue = { level: "error" | "warning"; file: string; message: string };
const issues: Issue[] = [];
const error = (file: string, message: string) => issues.push({ level: "error", file, message });
const warn = (file: string, message: string) => issues.push({ level: "warning", file, message });

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Decimal degrees ("12.3456, 104.5678") or degrees/minutes ("12°34'").
const COORDINATES =
  /\b\d{1,2}\.\d{3,}\s*°?\s*[NS]?\s*[,;/ ]\s*\d{2,3}\.\d{3,}|\d{1,3}\s*°\s*\d{1,2}\s*['′]/;

// ---------------------------------------------------------------------------
// Loading

type Entry<T> = { slug: string; file: string; data: T };

function readYaml(file: string): unknown {
  try {
    return parseYaml(readFileSync(file, "utf8")) ?? {};
  } catch (e) {
    error(file, `YAML syntax error: ${(e as Error).message.split("\n")[0]}`);
    return undefined;
  }
}

function parseWith<T extends z.ZodType>(
  schema: T,
  file: string,
  raw: unknown,
): z.infer<T> | undefined {
  if (raw === undefined) return undefined;
  const result = schema.safeParse(raw);
  if (result.success) return result.data;
  for (const issue of result.error.issues) {
    const field = issue.path.join(".") || "(file)";
    const message =
      issue.code === "unrecognized_keys"
        ? `unknown field(s): ${issue.keys.join(", ")}`
        : issue.message;
    error(file, `${field}: ${message}`);
  }
  return undefined;
}

/** Collections stored as content/<name>/<slug>.yaml */
function loadFlat<T extends z.ZodType>(name: string, schema: T): Entry<z.infer<T>>[] {
  const dir = join(contentDir, name);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".yaml"))
    .flatMap((f) => {
      const file = join(dir, f);
      const slug = basename(f, ".yaml");
      if (!SLUG.test(slug))
        error(file, `file name "${slug}" must be lower case words joined by "-"`);
      const data = parseWith(schema, file, readYaml(file));
      return data ? [{ slug, file, data }] : [];
    });
}

/** Collections stored as content/<name>/<slug>/index.yaml (+ .mdoc files) */
function loadNested<T extends z.ZodType>(name: string, schema: T): Entry<z.infer<T>>[] {
  const dir = join(contentDir, name);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((d) => statSync(join(dir, d)).isDirectory())
    .flatMap((slug) => {
      const file = join(dir, slug, "index.yaml");
      if (!existsSync(file)) {
        // Keystatic leaves empty folders behind after a delete; only warn if files remain.
        if (hasFiles(join(dir, slug))) error(join(dir, slug), "missing index.yaml");
        return [];
      }
      if (!SLUG.test(slug))
        error(file, `folder name "${slug}" must be lower case words joined by "-"`);
      const data = parseWith(schema, file, readYaml(file));
      return data ? [{ slug, file, data }] : [];
    });
}

function hasFiles(dir: string): boolean {
  return readdirSync(dir).some((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? hasFiles(p) : true;
  });
}

/** Reads a linked rich-text file, checks its Markdoc syntax, and returns its text ("" if absent). */
function readDoc(entryFile: string, field: string, lang: "km" | "en"): string {
  const file = join(entryFile, "..", field, `${lang}.mdoc`);
  if (!existsSync(file)) return "";
  const source = readFileSync(file, "utf8");
  for (const e of Markdoc.validate(Markdoc.parse(source))) {
    if (e.error.level === "error" || e.error.level === "critical") {
      error(file, `Markdoc: ${e.error.message} (line ${(e.lines[0] ?? 0) + 1})`);
    }
  }
  return source.trim();
}

// ---------------------------------------------------------------------------
// Checks

function checkUnique<T>(entries: Entry<T>[], key: (d: T) => string | undefined, label: string) {
  const seen = new Map<string, string>();
  for (const e of entries) {
    const value = key(e.data)?.trim().toLowerCase();
    if (!value) continue;
    const other = seen.get(value);
    if (other) error(e.file, `duplicate ${label} "${key(e.data)}" (also in ${other})`);
    else seen.set(value, e.file);
  }
}

function checkRelations(file: string, field: string, slugs: string[], known: Set<string>) {
  const seen = new Set<string>();
  for (const slug of slugs) {
    if (!known.has(slug)) error(file, `${field}: "${slug}" doesn't exist`);
    if (seen.has(slug)) warn(file, `${field}: "${slug}" is listed twice`);
    seen.add(slug);
  }
}

function checkPlant(p: Entry<PlantData>, known: Record<string, Set<string>>) {
  const { file, data: d } = p;

  // Identity
  const genus = d.scientificName.split(" ")[0];
  if (d.genus !== genus)
    error(file, `genus "${d.genus}" doesn't match the scientific name ("${genus}")`);
  if (p.slug !== slugify(d.scientificName)) {
    warn(
      file,
      `folder "${p.slug}" differs from the scientific name (expected "${slugify(d.scientificName)}")`,
    );
  }
  if (d.rank !== "species" && !/ (subsp\.|var\.|f\.) /.test(d.scientificName)) {
    error(file, `rank is "${d.rank}" but the scientific name has no subsp./var./f. part`);
  }

  // Relations
  checkRelations(file, "family", [d.family], known.families);
  checkRelations(file, "provinces", d.provinces, known.provinces);
  checkRelations(file, "habitats", d.habitats, known.habitats);
  checkRelations(file, "references", d.references, known.references);
  checkRelations(file, "contributors", d.contributors, known.contributors);

  // Where
  if (d.elevationMin != null && d.elevationMax != null && d.elevationMin > d.elevationMax) {
    error(file, "elevationMin is higher than elevationMax");
  }
  if ((THREATENED_IUCN as readonly string[]).includes(d.iucnStatus) && !d.isSensitive) {
    error(
      file,
      `IUCN status ${d.iucnStatus} is threatened: tick "Sensitive species" (isSensitive: true)`,
    );
  }

  // Text
  const docs = {
    description: { km: readDoc(file, "description", "km"), en: readDoc(file, "description", "en") },
    identification: {
      km: readDoc(file, "identification", "km"),
      en: readDoc(file, "identification", "en"),
    },
    usesNotes: { km: readDoc(file, "usesNotes", "km"), en: readDoc(file, "usesNotes", "en") },
  };

  // Uses: medicinal claims and use notes need a source.
  if (d.uses.includes("medicine") && d.references.length === 0) {
    error(file, 'uses includes "medicine": add at least one reference');
  }
  if ((docs.usesNotes.km || docs.usesNotes.en) && d.references.length === 0) {
    error(file, "uses notes are filled in: add at least one reference");
  }

  // Full profiles need real content.
  if (d.profileLevel === "full") {
    if (!d.summary.km && !d.summary.en) error(file, "full profile: add a summary");
    if (!docs.description.km && !docs.description.en)
      error(file, "full profile: add a description");
    if (d.references.length === 0) error(file, "full profile: add at least one reference");
  }
  if (d.summary.en && !d.summary.km) warn(file, "summary has no Khmer translation yet");

  // Sensitive species: no fine-grained locations anywhere in the text.
  if (d.isSensitive) {
    const texts = [
      d.summary.km,
      d.summary.en,
      ...Object.values(docs).flatMap((t) => [t.km, t.en]),
      ...d.images.flatMap((i) => [i.caption.km, i.caption.en]),
    ];
    if (texts.some((t) => t && COORDINATES.test(t))) {
      error(
        file,
        "sensitive species: remove GPS coordinates. Only province-level locations may be published",
      );
    }
  }

  // Photos
  for (const [i, img] of d.images.entries()) {
    if (!img.file.startsWith("/images/")) {
      error(file, `images.${i}.file: must be under /images/ (got "${img.file}")`);
    } else if (!existsSync(join(publicDir, img.file))) {
      error(file, `images.${i}.file: ${img.file} not found in public/`);
    }
  }
}

// ---------------------------------------------------------------------------
// Run

const families = loadFlat("families", familySchema);
const provinces = loadFlat("provinces", provinceSchema);
const habitats = loadFlat("habitats", habitatSchema);
const references = loadFlat("references", referenceSchema);
const contributors = loadFlat("contributors", contributorSchema);
const pages = loadNested("pages", pageSchema);
const plants = loadNested("plants", plantSchema);

const known = {
  families: new Set(families.map((e) => e.slug)),
  provinces: new Set(provinces.map((e) => e.slug)),
  habitats: new Set(habitats.map((e) => e.slug)),
  references: new Set(references.map((e) => e.slug)),
  contributors: new Set(contributors.map((e) => e.slug)),
};

checkUnique(families, (d) => d.name, "family");
checkUnique(provinces, (d) => d.isoCode, "ISO code");
checkUnique(provinces, (d) => d.name, "province");
checkUnique(habitats, (d) => d.name, "habitat");
checkUnique(references, (d) => d.shortCitation, "short citation");
checkUnique(plants, (d) => d.scientificName, "scientific name");
if (provinces.length !== 25) {
  warn(join(contentDir, "provinces"), `expected 25 provinces, found ${provinces.length}`);
}

// A synonym must not be the accepted name of another entry.
const accepted = new Map(plants.map((p) => [p.data.scientificName.toLowerCase(), p.file]));
for (const p of plants) {
  for (const syn of p.data.synonyms) {
    const other = accepted.get(syn.toLowerCase());
    if (other) error(p.file, `synonym "${syn}" is the accepted name in ${other}`);
  }
}

for (const p of plants) checkPlant(p, known);
for (const page of pages) {
  if (!readDoc(page.file, "body", "en") && !readDoc(page.file, "body", "km")) {
    warn(page.file, "page has no body text");
  }
}

// ---------------------------------------------------------------------------
// Report

const errors = issues.filter((i) => i.level === "error");
const warnings = issues.filter((i) => i.level === "warning");

for (const i of [...errors, ...warnings]) {
  const file = relative(process.cwd(), i.file).replaceAll("\\", "/");
  if (inCI) console.log(`::${i.level} file=${file}::${i.message}`);
  else console.log(`${i.level === "error" ? "✖" : "⚠"} ${file}: ${i.message}`);
}

const counts = [
  `${plants.length} plants`,
  `${families.length} families`,
  `${provinces.length} provinces`,
  `${habitats.length} habitats`,
  `${references.length} references`,
  `${contributors.length} contributors`,
  `${pages.length} pages`,
].join(", ");
console.log(`\nChecked ${counts}.`);
console.log(`${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length > 0 ? 1 : 0);
