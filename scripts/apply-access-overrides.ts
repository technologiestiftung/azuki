/**
 * Apply curated overrides to occupation `accessLevel` after fetch.
 *
 * BERUFENET reports the formal regulatory access requirement (field a30-0).
 * For a handful of Berufe — mostly design-Akademie pathways — the formal
 * requirement is permissive ("ohne Schulabschluss" or "Realschule") but the
 * de-facto access realism is Fachhochschulreife or Abitur:
 *   - The Ausbildung happens at private Akademien / Designschulen with
 *     selective admissions (Mappenprüfung, tuition).
 *   - The actual cohort is dominated by Abi-track applicants. Where BERUFENET
 *     publishes degreeStats (e.g. Bühnenmaler-Malerei: 75% Hochschulreife),
 *     this is confirmed; for the rest, degreeStats is null because the
 *     cohorts are too small for distribution reporting.
 *
 * The existing scoring and prompt infrastructure already handles "de-facto
 * FHR" cleanly via accessLevel="fachhochschulreife":
 *   - accessLevelPhrase emits "Fachhochschulreife — alternativ Realschule +
 *     vorherige Berufsausbildung", which the V3 system prompt teaches the
 *     LLM to read as "Realschul-Profil ohne Vorbildung → zu hoch".
 *   - scoreEducation applies -3 for accessLevel=fachhochschulreife when
 *     userTier is intermediate, pushing these Berufe down in preFilter.
 *   - For Hauptschule and empty-profile (default "secondary") users the
 *     penalty is -7, which de-facto removes them from top candidate windows.
 *
 * So the cleanest fix for the "Designer-Grafik bait" pattern surfaced by the
 * Tom rubric is a small data patch: re-label the design-family Berufe to
 * accessLevel="fachhochschulreife" and let all three existing systems do
 * their work without any new code or prompt changes.
 *
 * Add an entry only when:
 *   1. BERUFENET's formal accessLevel materially understates the practical
 *      access requirement (FHR-effective in practice), AND
 *   2. Either degreeStats confirms ≥60% Hochschulreife, OR the cohort is
 *      too small for degreeStats but the school type clearly selects for
 *      Abi (private Akademie, Mappenprüfung admission).
 *
 * Runs after hydrate-fachpraktiker so that §66 children — if any inherit
 * accessLevel from an overridden parent — are also corrected here. (None
 * of the current design-family parents have §66 children.)
 *
 * Run standalone: npx tsx scripts/apply-access-overrides.ts
 *   Reads backend/src/data/berufe.json, applies overrides in place, writes back.
 *
 * Called from fetch-berufe.ts in the normal fetch pipeline.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { AccessLevel, Occupation } from "@azuki/shared";

const ACCESS_OVERRIDES: Array<{
	ids: number[];
	accessLevel: AccessLevel;
	reason: string;
}> = [
	{
		// Design-Akademie family: formally Realschule or unrestricted in
		// BERUFENET, but de-facto FHR/Abi-clientele. These are schulische
		// Ausbildungen at private Designschulen / Akademien with Mappenprüfung
		// admissions; Bühnenmaler-Malerei's degreeStats (75% Hochschulreife)
		// confirms the pattern. The rubric flags these as "Tom-bait" — the
		// LLM picks them on vocabulary match (Designer/Gamedesigner sounds
		// related to gaming/anime/video skills) without recognizing the
		// access barrier. Re-labeling triggers the existing FHR-effektiv
		// prompt rule and -3 scoreEducation penalty.
		ids: [
			14217, // Designer/in (Ausbildung) - Grafik
			14869, // Gamedesigner/in (Ausbildung)
			14557, // Designer/in (Ausbildung) - angewandte Formgebung, Schmuck und Gerät
			14326, // Designer/in (Ausbildung) - Foto
			13968, // Designer/in (Ausbildung) - Kommunikationsdesign
			14319, // Designer/in (Ausbildung) - Mode
			8459, // Designer/in (Ausbildung) - Medien
			59038, // Audiodesigner/in - Musik (Ausbildung)
			8502, // Bühnenmaler/in und Bühnenplastiker/in - Malerei (degreeStats: 75% Hochschulreife)
			14080, // Bühnenmaler/in und Bühnenplastiker/in - Plastik
		],
		accessLevel: "fachhochschulreife",
		reason: "Design-Akademie family; formal access permissive, de-facto FHR/Abi-clientele",
	},
];

export interface AccessOverrideReport {
	id: number;
	name: string;
	before: AccessLevel | null;
	after: AccessLevel;
	reason: string;
}

export interface AccessOverrideResult {
	report: AccessOverrideReport[];
	/** Curated override ids that no longer resolve to a catalog occupation. */
	unresolvedIds: number[];
}

export function applyAccessOverrides(
	occupations: Occupation[],
): AccessOverrideResult {
	const occMap = new Map(occupations.map((o) => [o.id, o]));
	const report: AccessOverrideReport[] = [];
	const unresolvedIds: number[] = [];
	for (const { ids, accessLevel, reason } of ACCESS_OVERRIDES) {
		for (const id of ids) {
			const occ = occMap.get(id);
			if (!occ) {
				unresolvedIds.push(id);
				continue;
			}
			report.push({
				id,
				name: occ.name,
				before: occ.accessLevel ?? null,
				after: accessLevel,
				reason,
			});
			occ.accessLevel = accessLevel;
		}
	}
	return { report, unresolvedIds };
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const dataPath = resolve(
		fileURLToPath(import.meta.url),
		"../../backend/src/data/berufe.json",
	);
	const occupations: Occupation[] = JSON.parse(readFileSync(dataPath, "utf-8"));
	const { report, unresolvedIds } = applyAccessOverrides(occupations);
	console.log(`Applied ${report.length} access-level overrides.\n`);
	for (const r of report) {
		console.log(
			`  ${String(r.id).padEnd(7)} ${r.name.slice(0, 60).padEnd(60)} ${(r.before ?? "—")} → ${r.after}`,
		);
	}
	if (unresolvedIds.length > 0) {
		console.warn(
			`\nWARNING: ${unresolvedIds.length} override id(s) not found in catalog (stale curated list?): ${unresolvedIds.join(", ")}`,
		);
	}
	writeFileSync(dataPath, JSON.stringify(occupations, null, 2));
	console.log(`\nWrote ${dataPath}`);
}
