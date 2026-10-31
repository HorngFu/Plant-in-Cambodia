# Data dictionary

What every field in `content/` means, in plain language. Editors normally fill these in through the
Keystatic admin (`/keystatic`); this page is for anyone reading or reusing the files directly.

All data is published under **CC BY 4.0** (see [LICENSE-DATA](../LICENSE-DATA)). Run `pnpm validate`
to check the files against the rules below.

## How the files are laid out

```text
content/
├── plants/<slug>/
│   ├── index.yaml              all short fields
│   ├── description/km.mdoc     long texts: one Markdoc file per language
│   ├── description/en.mdoc
│   ├── identification/km.mdoc
│   ├── identification/en.mdoc
│   ├── usesNotes/km.mdoc
│   └── usesNotes/en.mdoc
├── pages/<slug>/index.yaml + body/km.mdoc + body/en.mdoc
├── families/<slug>.yaml
├── provinces/<slug>.yaml
├── habitats/<slug>.yaml
├── references/<slug>.yaml
└── contributors/<slug>.yaml
```

- The **slug** is the file or folder name: lower-case words joined by `-`, used in web addresses
  (for example `lagerstroemia-calyculata`). For plants it comes from the scientific name.
- Links between entries use the other entry's slug (for example `family: lythraceae`).
- Empty fields are left out of the YAML. `.mdoc` files may be missing or empty: that means "no text
  yet". Checklist entries usually have only `index.yaml`.
- `.mdoc` files are [Markdoc](https://markdoc.dev), which is Markdown with a few extras.
- Bilingual short texts are stored as `km:` (Khmer) and `en:` (English) side by side.

## Plants

### Identity

| Field            | Required | Meaning                                                                                                      |
| ---------------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| `scientificName` | yes      | Accepted scientific name **without** the author, e.g. `Lagerstroemia calyculata`. Must be unique.            |
| `author`         |          | Who named the plant (the "authority"), e.g. `Kurz` or `(Kurz) Craib`.                                        |
| `rank`           |          | `species` (default), `subspecies`, `variety` or `form`. Other ranks need `subsp.`, `var.` or `f.` in the name. |
| `family`         | yes      | Slug of the plant's family (see Families).                                                                   |
| `genus`          | yes      | First word of the scientific name. The validator checks they match.                                          |
| `synonyms`       |          | Other scientific names that mean the same plant. A synonym can't be another entry's accepted name.           |

### Names

| Field             | Meaning                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| `khmerName`       | Main Khmer name, written in Khmer script, e.g. `ស្រឡៅ`.                                          |
| `khmerNameLatin`  | The Khmer name in Latin letters, as people commonly write it, e.g. `Sralao`.                     |
| `englishName`     | Common English name, if there is one.                                                            |
| `otherLocalNames` | Other names: regional Khmer names or names in minority languages. Add the language in brackets. |

### Classification

| Field          | Values                                                                                                                                                                                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `growthForms`  | One or more of `tree`, `shrub`, `herb`, `climber`, `palm`, `bamboo`, `grass` (grass or sedge), `fern`, `aquatic`, `epiphyte` (grows on other plants).                                                                                                      |
| `originStatus` | `native` (grows here naturally), `endemic` (native and found only in Cambodia), `introduced` (brought by people), `naturalised` (introduced and now spreading on its own), `invasive` (introduced and causing harm), `cultivated` (only grown by people). |
| `iucnStatus`   | Global [IUCN Red List](https://www.iucnredlist.org) category: `NE` Not Evaluated (default), `DD` Data Deficient, `LC` Least Concern, `NT` Near Threatened, `VU` Vulnerable, `EN` Endangered, `CR` Critically Endangered, `EW` Extinct in the Wild, `EX` Extinct. |

### Where it grows

| Field                           | Meaning                                                                                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `provinces`                     | Slugs of the provinces where it is recorded.                                                                                                                 |
| `habitats`                      | Slugs of the habitats where it grows.                                                                                                                        |
| `elevationMin` / `elevationMax` | Lowest and highest elevation in metres (Cambodia's highest point is about 1,810 m).                                                                         |
| `isSensitive`                   | `true` for threatened or poached species. **Only province-level locations are ever published for them.** Required for IUCN `VU`, `EN` and `CR` plants. |

### When

| Field             | Meaning                                              |
| ----------------- | ---------------------------------------------------- |
| `floweringMonths` | Months it flowers in Cambodia, `"1"` (Jan) to `"12"` (Dec). |
| `fruitingMonths`  | Months it carries fruit.                             |

### Uses and safety

| Field       | Meaning                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| `uses`      | Any of `food`, `medicine`, `timber`, `fibre`, `ornamental`, `ritual` (ritual or religious), `fodder`, `dye`, `other`. `medicine` needs at least one reference. |
| `toxicity`  | Warning text (`km`/`en`) if any part of the plant is poisonous. Shown prominently on the plant page.                     |
| `usesNotes` | Long text about uses (`usesNotes/km.mdoc`, `usesNotes/en.mdoc`). Needs at least one reference. The site always adds a "not medical advice" note. |

### Texts

| Field            | Meaning                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------- |
| `summary`        | One or two sentences (`km`/`en`) shown on cards and in search results.                       |
| `description`    | Long description (`description/km.mdoc`, `description/en.mdoc`). Write in your own words.    |
| `identification` | How to recognise the plant, usually a short list of features.                                 |

### Photos (`images`)

Each photo has:

| Field       | Required | Meaning                                                                                       |
| ----------- | -------- | --------------------------------------------------------------------------------------------- |
| `file`      | yes      | Path under `public/`, e.g. `/images/plants/hopea-odorata/bark.webp`. The file must exist.     |
| `caption`   |          | Short caption (`km`/`en`).                                                                    |
| `author`    | yes      | Photographer's name, as they want to be credited.                                             |
| `license`   | yes      | `CC0-1.0`, `CC-BY-4.0` (default), `CC-BY-SA-4.0`, `CC-BY-NC-4.0`, or `permission` (used with permission, all rights reserved). |
| `sourceUrl` |          | Where the photo came from, if it was published elsewhere.                                     |

Photos of sensitive species must not reveal the location (GPS data is stripped in Phase 8).

### External databases (`links`)

| Field           | Example                              |
| --------------- | ------------------------------------ |
| `gbifKey`       | `2874875` (GBIF taxon key, a number) |
| `powoId`        | `urn:lsid:ipni.org:names:...`        |
| `wfoId`         | `wfo-0000412345`                     |
| `iucnId`        | `32308` (IUCN taxon ID, a number)    |
| `inaturalistId` | `12345` (iNaturalist taxon ID)       |

### Trust

| Field          | Meaning                                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| `references`   | Slugs of the sources used (see References). Full profiles need at least one.                             |
| `profileLevel` | `checklist`: names and status only (most imported entries). `full`: has a summary, description and references. |
| `reviewStatus` | `draft` until a second editor has checked it, then `reviewed`.                                           |
| `lastReviewed` | Date of the last review, `YYYY-MM-DD`.                                                                    |
| `contributors` | Slugs of the people who wrote or edited the entry (see Contributors).                                     |

## Families

| Field         | Meaning                                                    |
| ------------- | ---------------------------------------------------------- |
| `name`        | Scientific family name, e.g. `Dipterocarpaceae`. Unique.   |
| `khmerName`   | Khmer name, if one is in use.                              |
| `englishName` | e.g. `Dipterocarp family`.                                 |
| `order`       | The order the family belongs to (APG IV), e.g. `Malvales`. |
| `description` | Short description (`km`/`en`).                             |

## Provinces

The 24 provinces and the capital, Phnom Penh.

| Field        | Meaning                                                                       |
| ------------ | ----------------------------------------------------------------------------- |
| `name`       | English name, e.g. `Siem Reap`.                                               |
| `khmerName`  | Khmer name, e.g. `សៀមរាប`.                                                   |
| `isoCode`    | ISO 3166-2 code, `KH-1` to `KH-25`. Unique.                                   |
| `boundaryId` | geoBoundaries ADM1 shape ID, used to draw maps (filled in Phase 8).           |

## Habitats

| Field         | Meaning                        |
| ------------- | ------------------------------ |
| `name`        | English name, e.g. `Mangrove`. |
| `khmerName`   | Khmer name.                    |
| `description` | Short description (`km`/`en`). |

## References

| Field           | Required | Meaning                                                                 |
| --------------- | -------- | ----------------------------------------------------------------------- |
| `shortCitation` | yes      | Author and year as shown on plant pages, e.g. `Dy Phon 2000`. Unique.   |
| `citation`      | yes      | Full citation.                                                          |
| `type`          | yes      | `book`, `article`, `website`, `database` or `other`.                    |
| `year`          |          | Year published.                                                         |
| `url`           |          | Web address.                                                            |
| `doi`           |          | DOI, e.g. `10.1234/abcd`.                                               |

## Contributors

| Field       | Meaning                                                                    |
| ----------- | -------------------------------------------------------------------------- |
| `name`      | Name as the person wants to be credited.                                   |
| `khmerName` | Name in Khmer script.                                                      |
| `roles`     | Any of `editor`, `reviewer`, `photographer`, `translator`, `developer`.   |
| `url`       | Website or profile link.                                                   |

Only add people who agreed to be listed.

## Pages

Site pages such as About, License and Contribute.

| Field     | Meaning                                              |
| --------- | ---------------------------------------------------- |
| `title`   | English title (the slug comes from it).              |
| `titleKm` | Khmer title.                                         |
| `body`    | Page text (`body/km.mdoc`, `body/en.mdoc`).          |

## What `pnpm validate` checks

**Errors** (block publishing):

- YAML syntax, required fields, allowed values, and unknown or misspelled field names
- Links to entries that don't exist (family, provinces, habitats, references, contributors)
- Duplicate scientific names, or a synonym that is another entry's accepted name
- Genus doesn't match the scientific name; rank doesn't match the name
- Khmer names not written in Khmer script
- Threatened plants (`VU`, `EN`, `CR`) not marked `isSensitive`
- GPS coordinates in the text of a sensitive species
- `medicine` uses or uses notes without a reference
- Full profiles without a summary, description or reference
- Photos without an author or license, or whose file is missing
- Markdoc syntax errors; duplicate family names, provinces, ISO codes or short citations

**Warnings** (shown, but don't block): missing Khmer translations, folder names that don't match the
scientific name, the same link listed twice, not exactly 25 provinces, pages without text.
