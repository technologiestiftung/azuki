/**
 * Post-fetch step: drop occupations that shouldn't surface in results.
 *  - §66 BBiG / §42r HwO Fachpraktiker: Reha-only trainings, not openly accessible.
 *  - Joblinge-flagged jobs: frozen id list in ./data/joblinge-exclusions.json.
 * Standalone run rewrites backend/src/data/berufe.json in place.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Occupation } from "@azuki/shared";
import exclusionList from "./data/joblinge-exclusions.json";

export const SECTION_66_NAME_RE = /\(§\s*66\s*BBiG|§\s*42r\s*HwO/i;

// Joblinge's two id-list signals: not_suitable = their "Richtige Ausbildung?" column said nein;
// flagged = they highlighted the row for removal. (section66 comes from the name regex above.)
type ExclusionReason = "not_suitable" | "flagged";
const EXCLUDED_IDS = new Map<number, ExclusionReason>(
  (exclusionList as { id: number; reason: ExclusionReason }[]).map((e) => [e.id, e.reason]),
);

export interface Removal {
  id: number;
  name: string;
  reason: "section66" | ExclusionReason;
}

export interface ExclusionResult {
  occupations: Occupation[];
  removed: Removal[];
}

export function applyJoblingeExclusions(occupations: Occupation[]): ExclusionResult {
  const kept: Occupation[] = [];
  const removed: Removal[] = [];
  for (const occ of occupations) {
    if (SECTION_66_NAME_RE.test(occ.name)) {
      removed.push({ id: occ.id, name: occ.name, reason: "section66" });
      continue;
    }
    const reason = EXCLUDED_IDS.get(occ.id);
    if (reason) {
      removed.push({ id: occ.id, name: occ.name, reason });
      continue;
    }
    kept.push(occ);
  }
  return { occupations: kept, removed };
}

// Standalone entry point: read berufe.json, remove matches, write back.
if (import.meta.url === `file://${process.argv[1]}`) {
  const dataPath = resolve(fileURLToPath(import.meta.url), "../../backend/src/data/berufe.json");
  const occupations: Occupation[] = JSON.parse(readFileSync(dataPath, "utf-8"));
  const { occupations: kept, removed } = applyJoblingeExclusions(occupations);
  const bySection66 = removed.filter((r) => r.reason === "section66").length;
  console.log(
    `Removed ${removed.length} occupations (${bySection66} §66, ${removed.length - bySection66} Joblinge-listed). ${kept.length} remain.`,
  );
  const listedButAbsent = [...EXCLUDED_IDS.keys()].filter(
    (id) => !occupations.some((o) => o.id === id),
  );
  if (listedButAbsent.length > 0) {
    console.warn(`WARNING: ${listedButAbsent.length} exclusion id(s) not in catalog: ${listedButAbsent.join(", ")}`);
  }
  writeFileSync(dataPath, JSON.stringify(kept, null, 2));
  console.log(`Wrote ${dataPath}`);
}
