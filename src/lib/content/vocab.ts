/**
 * Controlled vocabularies shared by Keystatic, the content validator and the website.
 * Values are stored in content files, so never rename a value without migrating content.
 * Khmer labels for the public site live in messages/km.json (Phase 3).
 */

const vocab = <const T extends readonly { value: string; label: string }[]>(items: T) => items;
export const values = <T extends readonly { value: string }[]>(items: T) =>
  items.map((i) => i.value) as unknown as [T[number]["value"], ...T[number]["value"][]];

export const RANKS = vocab([
  { value: "species", label: "Species" },
  { value: "subspecies", label: "Subspecies" },
  { value: "variety", label: "Variety" },
  { value: "form", label: "Form" },
]);

export const GROWTH_FORMS = vocab([
  { value: "tree", label: "Tree" },
  { value: "shrub", label: "Shrub" },
  { value: "herb", label: "Herb" },
  { value: "climber", label: "Climber" },
  { value: "palm", label: "Palm" },
  { value: "bamboo", label: "Bamboo" },
  { value: "grass", label: "Grass or sedge" },
  { value: "fern", label: "Fern" },
  { value: "aquatic", label: "Aquatic" },
  { value: "epiphyte", label: "Epiphyte" },
]);

export const ORIGIN_STATUSES = vocab([
  { value: "native", label: "Native" },
  { value: "endemic", label: "Endemic (only in Cambodia)" },
  { value: "introduced", label: "Introduced" },
  { value: "naturalised", label: "Naturalised" },
  { value: "invasive", label: "Invasive" },
  { value: "cultivated", label: "Cultivated only" },
]);

export const IUCN_STATUSES = vocab([
  { value: "NE", label: "Not Evaluated (NE)" },
  { value: "DD", label: "Data Deficient (DD)" },
  { value: "LC", label: "Least Concern (LC)" },
  { value: "NT", label: "Near Threatened (NT)" },
  { value: "VU", label: "Vulnerable (VU)" },
  { value: "EN", label: "Endangered (EN)" },
  { value: "CR", label: "Critically Endangered (CR)" },
  { value: "EW", label: "Extinct in the Wild (EW)" },
  { value: "EX", label: "Extinct (EX)" },
]);

/** IUCN categories that count as threatened. Plants in these are treated as sensitive. */
export const THREATENED_IUCN = ["VU", "EN", "CR"] as const;

export const MONTHS = vocab([
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
]);

export const USES = vocab([
  { value: "food", label: "Food" },
  { value: "medicine", label: "Medicine" },
  { value: "timber", label: "Timber" },
  { value: "fibre", label: "Fibre" },
  { value: "ornamental", label: "Ornamental" },
  { value: "ritual", label: "Ritual or religious" },
  { value: "fodder", label: "Fodder" },
  { value: "dye", label: "Dye" },
  { value: "other", label: "Other" },
]);

export const IMAGE_LICENSES = vocab([
  { value: "CC0-1.0", label: "CC0 (public domain)" },
  { value: "CC-BY-4.0", label: "CC BY 4.0" },
  { value: "CC-BY-SA-4.0", label: "CC BY-SA 4.0" },
  { value: "CC-BY-NC-4.0", label: "CC BY-NC 4.0" },
  { value: "permission", label: "Used with permission (all rights reserved)" },
]);

export const PROFILE_LEVELS = vocab([
  { value: "checklist", label: "Checklist entry (names and status only)" },
  { value: "full", label: "Full profile (description, photos, uses)" },
]);

export const REVIEW_STATUSES = vocab([
  { value: "draft", label: "Draft" },
  { value: "reviewed", label: "Reviewed" },
]);

export const REFERENCE_TYPES = vocab([
  { value: "book", label: "Book" },
  { value: "article", label: "Journal article" },
  { value: "website", label: "Website" },
  { value: "database", label: "Database" },
  { value: "other", label: "Other" },
]);

export const CONTRIBUTOR_ROLES = vocab([
  { value: "editor", label: "Editor" },
  { value: "reviewer", label: "Reviewer" },
  { value: "photographer", label: "Photographer" },
  { value: "translator", label: "Translator" },
  { value: "developer", label: "Developer" },
]);
