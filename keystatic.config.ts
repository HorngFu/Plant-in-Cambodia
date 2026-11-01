import { collection, config, fields } from "@keystatic/core";
import {
  GROWTH_FORMS,
  IMAGE_LICENSES,
  IUCN_STATUSES,
  MONTHS,
  ORIGIN_STATUSES,
  PROFILE_LEVELS,
  RANKS,
  REFERENCE_TYPES,
  CONTRIBUTOR_ROLES,
  REVIEW_STATUSES,
  USES,
} from "./src/lib/content/vocab";

/** A short text in both languages, stored side by side in the entry's YAML. */
const bilingualText = (label: string, opts: { multiline?: boolean; description?: string } = {}) =>
  fields.object(
    {
      km: fields.text({ label: `${label} (ខ្មែរ)`, multiline: opts.multiline }),
      en: fields.text({ label: `${label} (English)`, multiline: opts.multiline }),
    },
    { label, description: opts.description },
  );

/** A long rich text in both languages, stored as separate .mdoc files next to the entry. */
const bilingualDoc = (label: string, description?: string) =>
  fields.object(
    {
      km: fields.markdoc({ label: `${label} (ខ្មែរ)` }),
      en: fields.markdoc({ label: `${label} (English)` }),
    },
    { label, description },
  );

const options = <T extends string>(values: readonly { value: T; label: string }[]) =>
  values.map(({ value, label }) => ({ value, label }));

export default config({
  // Local mode until Phase 5 switches production to GitHub mode.
  storage: { kind: "local" },
  ui: {
    brand: { name: "Plant in Cambodia" },
    navigation: {
      Plants: ["plants", "families"],
      Places: ["provinces", "habitats"],
      Sources: ["references", "contributors"],
      Site: ["pages"],
    },
  },
  collections: {
    plants: collection({
      label: "Plants",
      slugField: "scientificName",
      path: "content/plants/*/",
      format: { data: "yaml" },
      entryLayout: "form",
      columns: ["scientificName", "khmerName", "englishName"],
      schema: {
        // Identity
        scientificName: fields.slug({
          name: {
            label: "Scientific name",
            description: "Without the author, e.g. Lagerstroemia calyculata",
            validation: { isRequired: true },
          },
          slug: { label: "URL slug", description: "Lower case, e.g. lagerstroemia-calyculata" },
        }),
        author: fields.text({ label: "Author", description: "Name authority, e.g. Kurz" }),
        rank: fields.select({ label: "Rank", options: options(RANKS), defaultValue: "species" }),
        family: fields.relationship({
          label: "Family",
          collection: "families",
          validation: { isRequired: true },
        }),
        genus: fields.text({ label: "Genus", validation: { isRequired: true } }),
        synonyms: fields.array(fields.text({ label: "Synonym" }), {
          label: "Synonyms",
          itemLabel: (props) => props.value || "Synonym",
        }),

        // Names
        khmerName: fields.text({ label: "Khmer name", description: "e.g. ស្រឡៅ" }),
        khmerNameLatin: fields.text({
          label: "Khmer name (romanised)",
          description: "How the Khmer name is written in Latin letters, e.g. Sralao",
        }),
        englishName: fields.text({ label: "English name" }),
        otherLocalNames: fields.array(fields.text({ label: "Name" }), {
          label: "Other local names",
          description: "Regional or minority-language names. Add the language in brackets.",
          itemLabel: (props) => props.value || "Name",
        }),

        // Classification
        growthForms: fields.multiselect({ label: "Growth form", options: options(GROWTH_FORMS) }),
        originStatus: fields.select({
          label: "Origin in Cambodia",
          options: options(ORIGIN_STATUSES),
          defaultValue: "native",
        }),
        iucnStatus: fields.select({
          label: "IUCN Red List status",
          options: options(IUCN_STATUSES),
          defaultValue: "NE",
        }),

        // Where
        provinces: fields.multiRelationship({ label: "Provinces", collection: "provinces" }),
        habitats: fields.multiRelationship({ label: "Habitats", collection: "habitats" }),
        elevationMin: fields.integer({ label: "Lowest elevation (m)" }),
        elevationMax: fields.integer({ label: "Highest elevation (m)" }),
        isSensitive: fields.checkbox({
          label: "Sensitive species",
          description:
            "Tick for threatened or poached species. Only province-level locations are ever published.",
        }),

        // When
        floweringMonths: fields.multiselect({
          label: "Flowering months",
          options: options(MONTHS),
        }),
        fruitingMonths: fields.multiselect({ label: "Fruiting months", options: options(MONTHS) }),

        // Uses
        uses: fields.multiselect({ label: "Uses", options: options(USES) }),
        toxicity: bilingualText("Toxicity warning", {
          multiline: true,
          description: "Leave empty if the plant is not known to be toxic.",
        }),

        // Text
        summary: bilingualText("Summary", {
          multiline: true,
          description: "One or two sentences shown on cards and in search results.",
        }),
        description: bilingualDoc("Description"),
        identification: bilingualDoc("How to identify"),
        usesNotes: bilingualDoc(
          "Uses",
          "Medicinal or edible uses must cite a reference. The site adds a 'not medical advice' note.",
        ),

        // Media
        images: fields.array(
          fields.object({
            file: fields.image({
              label: "Photo",
              directory: "public/images/plants",
              publicPath: "/images/plants/",
              validation: { isRequired: true },
            }),
            caption: bilingualText("Caption"),
            author: fields.text({ label: "Photographer", validation: { isRequired: true } }),
            license: fields.select({
              label: "License",
              options: options(IMAGE_LICENSES),
              defaultValue: "CC-BY-4.0",
            }),
            sourceUrl: fields.url({ label: "Source URL" }),
          }),
          {
            label: "Photos",
            itemLabel: (props) => props.fields.author.value || "Photo",
          },
        ),

        // Links
        links: fields.object(
          {
            gbifKey: fields.text({ label: "GBIF taxon key" }),
            powoId: fields.text({
              label: "POWO ID",
              description: "e.g. urn:lsid:ipni.org:names:...",
            }),
            wfoId: fields.text({ label: "World Flora Online ID", description: "e.g. wfo-0000..." }),
            iucnId: fields.text({ label: "IUCN Red List ID" }),
            inaturalistId: fields.text({ label: "iNaturalist taxon ID" }),
          },
          { label: "External databases" },
        ),

        // Trust
        references: fields.multiRelationship({ label: "References", collection: "references" }),
        profileLevel: fields.select({
          label: "Profile level",
          options: options(PROFILE_LEVELS),
          defaultValue: "checklist",
        }),
        reviewStatus: fields.select({
          label: "Review status",
          options: options(REVIEW_STATUSES),
          defaultValue: "draft",
        }),
        lastReviewed: fields.date({ label: "Last reviewed" }),
        contributors: fields.multiRelationship({
          label: "Contributors",
          collection: "contributors",
        }),
      },
    }),

    families: collection({
      label: "Families",
      slugField: "name",
      path: "content/families/*",
      format: { data: "yaml" },
      columns: ["name", "khmerName", "englishName"],
      schema: {
        name: fields.slug({
          name: { label: "Scientific name", validation: { isRequired: true } },
        }),
        khmerName: fields.text({ label: "Khmer name" }),
        englishName: fields.text({ label: "English name" }),
        order: fields.text({ label: "Order", description: "e.g. Myrtales" }),
        description: bilingualText("Short description", { multiline: true }),
      },
    }),

    provinces: collection({
      label: "Provinces",
      slugField: "name",
      path: "content/provinces/*",
      format: { data: "yaml" },
      columns: ["name", "khmerName", "isoCode"],
      schema: {
        name: fields.slug({ name: { label: "English name", validation: { isRequired: true } } }),
        khmerName: fields.text({ label: "Khmer name", validation: { isRequired: true } }),
        isoCode: fields.text({
          label: "ISO 3166-2 code",
          description: "e.g. KH-12",
          validation: {
            isRequired: true,
            pattern: { regex: /^KH-\d{1,2}$/, message: "Use KH-<number>" },
          },
        }),
        boundaryId: fields.text({
          label: "Boundary ID",
          description: "geoBoundaries ADM1 shape ID (used for maps in Phase 8)",
        }),
      },
    }),

    habitats: collection({
      label: "Habitats",
      slugField: "name",
      path: "content/habitats/*",
      format: { data: "yaml" },
      columns: ["name", "khmerName"],
      schema: {
        name: fields.slug({ name: { label: "English name", validation: { isRequired: true } } }),
        khmerName: fields.text({ label: "Khmer name", validation: { isRequired: true } }),
        description: bilingualText("Short description", { multiline: true }),
      },
    }),

    references: collection({
      label: "References",
      slugField: "shortCitation",
      path: "content/references/*",
      format: { data: "yaml" },
      columns: ["shortCitation", "year"],
      schema: {
        shortCitation: fields.slug({
          name: {
            label: "Short citation",
            description: "Author and year, e.g. Dy Phon 2000",
            validation: { isRequired: true },
          },
        }),
        citation: fields.text({
          label: "Full citation",
          multiline: true,
          validation: { isRequired: true },
        }),
        type: fields.select({
          label: "Type",
          options: options(REFERENCE_TYPES),
          defaultValue: "book",
        }),
        year: fields.integer({ label: "Year" }),
        url: fields.url({ label: "URL" }),
        doi: fields.text({ label: "DOI", description: "e.g. 10.1234/abcd" }),
      },
    }),

    contributors: collection({
      label: "Contributors",
      slugField: "name",
      path: "content/contributors/*",
      format: { data: "yaml" },
      columns: ["name"],
      schema: {
        name: fields.slug({ name: { label: "Name", validation: { isRequired: true } } }),
        khmerName: fields.text({ label: "Name in Khmer" }),
        roles: fields.multiselect({ label: "Roles", options: options(CONTRIBUTOR_ROLES) }),
        url: fields.url({ label: "Website or profile" }),
      },
    }),

    pages: collection({
      label: "Pages",
      slugField: "title",
      path: "content/pages/*/",
      format: { data: "yaml" },
      entryLayout: "form",
      schema: {
        title: fields.slug({
          name: { label: "Title (English)", validation: { isRequired: true } },
        }),
        titleKm: fields.text({ label: "Title (ខ្មែរ)", validation: { isRequired: true } }),
        body: bilingualDoc("Body"),
      },
    }),
  },
});
