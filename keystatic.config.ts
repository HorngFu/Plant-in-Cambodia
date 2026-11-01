import { collection, config, fields } from "@keystatic/core";

// Phase 1 placeholder: the full content model is added in Phase 2.
export default config({
  storage: { kind: "local" },
  ui: { brand: { name: "Plant in Cambodia" } },
  collections: {
    plants: collection({
      label: "Plants",
      slugField: "scientificName",
      path: "content/plants/*/",
      format: "yaml",
      schema: {
        scientificName: fields.slug({ name: { label: "Scientific name" } }),
      },
    }),
  },
});
