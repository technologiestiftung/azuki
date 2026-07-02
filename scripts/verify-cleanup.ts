/**
 * Read-only post-cleanup check: berufe.json is at 538 with no §66/§42r names, and
 * the display formatter turns every " - " into one spaced en-dash (293 names) with
 * no digit-adjacent or unspaced dashes. Exits non-zero on drift.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { formatOccupationDisplayName } from "@azuki/shared";
import type { Occupation } from "@azuki/shared";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const berufe: Occupation[] = JSON.parse(
  readFileSync(resolve(ROOT, "backend/src/data/berufe.json"), "utf8"),
);

const fail: string[] = [];
if (berufe.length !== 538) fail.push(`expected 538 occupations, got ${berufe.length}`);
const stillParagraph = berufe.filter((b) => /§\s*66|§\s*42r/i.test(b.name));
if (stillParagraph.length) fail.push(`${stillParagraph.length} §66/§42r names survived`);

let enDashedNames = 0;
for (const b of berufe) {
  const out = formatOccupationDisplayName(b.name);
  const rawSeparators = (b.name.match(/ - /g) ?? []).length;
  const enDashes = (out.match(/–/g) ?? []).length;
  if (out !== b.name) console.log(`  ${b.name}\n    -> ${out}`);
  if (enDashes > 0) enDashedNames++;

  // The swap must be faithful: one en-dash per raw " - " separator, no more, no less.
  if (enDashes !== rawSeparators) {
    fail.push(`en-dash count ${enDashes} != raw separator count ${rawSeparators}: ${b.name} -> ${out}`);
  }
  // Guard: no en-dash adjacent to a digit (would signal a mangled range).
  if (/\d\s*–|–\s*\d/.test(out)) fail.push(`digit-adjacent en-dash: ${out}`);
  // Guard: every en-dash must be spaced on both sides (never inside a compound word).
  if (/\S–|–\S/.test(out)) fail.push(`non-spaced en-dash: ${out}`);
}
console.log(`\nnames with an en-dash separator: ${enDashedNames}`);

if (fail.length) {
  console.error("\nFAILURES:\n" + fail.map((f) => "  - " + f).join("\n"));
  process.exit(1);
}
if (enDashedNames !== 293) {
  console.error(`\nFAILURE: expected 293 names with an en-dash separator, got ${enDashedNames}`);
  process.exit(1);
}
console.log("OK — all verification guards passed (293 names en-dashed, no false positives).");
