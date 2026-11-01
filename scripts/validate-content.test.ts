import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import assert from "node:assert/strict";

const validate = (dir: string) =>
  spawnSync(process.execPath, ["--import", "tsx", "scripts/validate-content.ts", dir], {
    encoding: "utf8",
    env: { ...process.env, GITHUB_ACTIONS: "" },
  });

let dir: string;

before(() => {
  dir = mkdtempSync(join(tmpdir(), "pic-content-"));
  cpSync("content", dir, { recursive: true });
});
after(() => rmSync(dir, { recursive: true, force: true }));

test("the repo's content is valid", () => {
  const result = validate("content");
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test("broken entries are caught", () => {
  const plant = (slug: string, yaml: string, description = "") => {
    mkdirSync(join(dir, "plants", slug, "description"), { recursive: true });
    writeFileSync(join(dir, "plants", slug, "index.yaml"), yaml);
    writeFileSync(join(dir, "plants", slug, "description", "en.mdoc"), description);
  };

  plant(
    "broken-plant",
    [
      "scientificName: Broken plant",
      "genus: Wrong",
      "family: not-a-family",
      "originStatus: native",
      "iucnStatus: EN",
      "provinces: [atlantis]",
      "uses: [medicine]",
      "khmerName: Not Khmer",
      "images:",
      "  - file: /images/plants/missing.webp",
      "    license: CC-BY-4.0",
      "colour: green",
    ].join("\n"),
  );
  plant(
    "hopea-odorata-copy",
    [
      "scientificName: Hopea odorata",
      "genus: Hopea",
      "family: dipterocarpaceae",
      "originStatus: native",
      "iucnStatus: XX",
      "isSensitive: true",
      "references: [powo]",
    ].join("\n"),
  );
  plant(
    "sensitive-with-gps",
    [
      "scientificName: Sensitive withgps",
      "genus: Sensitive",
      "family: fabaceae",
      "originStatus: native",
      "isSensitive: true",
    ].join("\n"),
    "Found at 13.4125, 103.8670 near the old road.",
  );

  const result = validate(dir);
  const out = result.stdout;
  assert.equal(result.status, 1, "validator should fail");

  const expected = [
    "unknown field(s): colour", // typo / unknown field
    "khmerName: must be written in Khmer script",
    "images.0.author: every photo needs a photographer", // photo without author
    "iucnStatus: Invalid option", // bad vocabulary value
  ];
  for (const message of expected) assert.match(out, new RegExp(escape(message)), message);

  // Fix the schema errors so the cross-entry checks run on broken-plant.
  writeFileSync(
    join(dir, "plants", "broken-plant", "index.yaml"),
    [
      "scientificName: Broken plant",
      "genus: Wrong",
      "family: not-a-family",
      "originStatus: native",
      "iucnStatus: EN",
      "provinces: [atlantis]",
      "uses: [medicine]",
      "images:",
      "  - file: /images/plants/missing.webp",
      "    author: Someone",
      "    license: CC-BY-4.0",
    ].join("\n"),
  );
  writeFileSync(
    join(dir, "plants", "hopea-odorata-copy", "index.yaml"),
    "scientificName: Hopea odorata\ngenus: Hopea\nfamily: dipterocarpaceae\noriginStatus: native\n",
  );

  const second = validate(dir).stdout;
  const crossChecks = [
    `genus "Wrong" doesn't match the scientific name`,
    `family: "not-a-family" doesn't exist`, // broken relation
    `provinces: "atlantis" doesn't exist`,
    "IUCN status EN is threatened", // threatened but not sensitive
    'uses includes "medicine": add at least one reference', // medicinal claim without source
    "/images/plants/missing.webp not found",
    'duplicate scientific name "Hopea odorata"',
    "sensitive species: remove GPS coordinates",
  ];
  for (const message of crossChecks) assert.match(second, new RegExp(escape(message)), message);
});

function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
