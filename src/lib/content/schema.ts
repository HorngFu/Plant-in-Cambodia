/**
 * Zod schemas for the raw YAML files in content/. They mirror keystatic.config.ts and are used by
 * scripts/validate-content.ts to catch hand-edited mistakes Keystatic would never write.
 * Field meanings: docs/DATA_DICTIONARY.md.
 */
import { z } from "zod";
import {
  CONTRIBUTOR_ROLES,
  GROWTH_FORMS,
  IMAGE_LICENSES,
  IUCN_STATUSES,
  MONTHS,
  ORIGIN_STATUSES,
  PROFILE_LEVELS,
  RANKS,
  REFERENCE_TYPES,
  REVIEW_STATUSES,
  USES,
  values,
} from "./vocab";

const KHMER_SCRIPT = /[ក-៿]/;

const text = z.string().trim().min(1);
const khmerText = text.regex(KHMER_SCRIPT, "must be written in Khmer script");
const list = <T extends z.ZodType>(item: T) => z.array(item).default([]);
const enumOf = <T extends readonly { value: string }[]>(items: T) => z.enum(values(items));

/** Short text in both languages. Keystatic leaves out empty languages. */
const bilingual = z
  .object({ km: z.string().optional(), en: z.string().optional() })
  .strict()
  .default({});

/** Rich text stored in .mdoc files next to the entry; the YAML only holds an empty object. */
const linkedDoc = z.object({}).strict().default({});

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use YYYY-MM-DD");

// Genus, optional hybrid sign, epithet, optional infraspecific rank and name.
const SCIENTIFIC_NAME =
  /^[A-Z][a-z]+(?:-[a-z]+)? (?:× ?)?[a-z]+(?:-[a-z]+)*(?: (?:subsp\.|var\.|f\.) [a-z]+(?:-[a-z]+)*)?$/;

export const plantSchema = z
  .object({
    // Identity
    scientificName: text.regex(
      SCIENTIFIC_NAME,
      "should look like 'Genus epithet' (optionally 'subsp.|var.|f. name'), without the author",
    ),
    author: z.string().optional(),
    rank: enumOf(RANKS).default("species"),
    family: text,
    genus: text,
    synonyms: list(text),

    // Names
    khmerName: khmerText.optional(),
    khmerNameLatin: z.string().optional(),
    englishName: z.string().optional(),
    otherLocalNames: list(text),

    // Classification
    growthForms: list(enumOf(GROWTH_FORMS)),
    originStatus: enumOf(ORIGIN_STATUSES),
    iucnStatus: enumOf(IUCN_STATUSES).default("NE"),

    // Where
    provinces: list(text),
    habitats: list(text),
    elevationMin: z.number().int().min(0).max(2000).nullish(),
    elevationMax: z.number().int().min(0).max(2000).nullish(),
    isSensitive: z.boolean().default(false),

    // When
    floweringMonths: list(enumOf(MONTHS)),
    fruitingMonths: list(enumOf(MONTHS)),

    // Uses
    uses: list(enumOf(USES)),
    toxicity: bilingual,

    // Text
    summary: bilingual,
    description: linkedDoc,
    identification: linkedDoc,
    usesNotes: linkedDoc,

    // Media
    images: list(
      z
        .object({
          file: text,
          caption: bilingual,
          author: z.string({ error: "every photo needs a photographer" }).trim().min(1, {
            error: "every photo needs a photographer",
          }),
          license: enumOf(IMAGE_LICENSES),
          sourceUrl: z.url().optional(),
        })
        .strict(),
    ),

    // Links
    links: z
      .object({
        gbifKey: z.string().regex(/^\d+$/, "GBIF keys are numbers").optional(),
        powoId: z.string().optional(),
        wfoId: z.string().regex(/^wfo-\d{10}$/, "use the form wfo-0000000000").optional(),
        iucnId: z.string().regex(/^\d+$/, "IUCN IDs are numbers").optional(),
        inaturalistId: z.string().regex(/^\d+$/, "iNaturalist IDs are numbers").optional(),
      })
      .strict()
      .default({}),

    // Trust
    references: list(text),
    profileLevel: enumOf(PROFILE_LEVELS).default("checklist"),
    reviewStatus: enumOf(REVIEW_STATUSES).default("draft"),
    lastReviewed: date.optional(),
    contributors: list(text),
  })
  .strict();

export const familySchema = z
  .object({
    name: text.regex(/^[A-Z][a-z]+aceae$|^(?:Compositae|Cruciferae|Gramineae|Guttiferae|Labiatae|Leguminosae|Palmae|Umbelliferae)$/, "should be a family name ending in -aceae"),
    khmerName: z.string().optional(),
    englishName: z.string().optional(),
    order: z.string().optional(),
    description: bilingual,
  })
  .strict();

export const provinceSchema = z
  .object({
    name: text,
    khmerName: khmerText,
    isoCode: text.regex(/^KH-(?:[1-9]|1\d|2[0-5])$/, "use KH-1 to KH-25"),
    boundaryId: z.string().optional(),
  })
  .strict();

export const habitatSchema = z
  .object({
    name: text,
    khmerName: khmerText,
    description: bilingual,
  })
  .strict();

export const referenceSchema = z
  .object({
    shortCitation: text,
    citation: text,
    type: enumOf(REFERENCE_TYPES),
    year: z.number().int().min(1700).max(2100).nullish(),
    url: z.url().optional(),
    doi: z.string().regex(/^10\.\d{4,9}\/\S+$/, "use the form 10.xxxx/yyyy").optional(),
  })
  .strict();

export const contributorSchema = z
  .object({
    name: text,
    khmerName: z.string().optional(),
    roles: list(enumOf(CONTRIBUTOR_ROLES)),
    url: z.url().optional(),
  })
  .strict();

export const pageSchema = z
  .object({
    title: text,
    titleKm: khmerText,
    body: linkedDoc,
  })
  .strict();

export type PlantData = z.infer<typeof plantSchema>;
