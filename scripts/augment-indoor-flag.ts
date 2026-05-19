/**
 * One-shot migration: add the `indoor` boolean to every record in
 * backend/src/data/berufe.json based on the `workLocations` text already
 * stored on each Occupation, plus the existing office/workshop flags.
 *
 * Re-runs are idempotent. Safe to invoke after `fetch-berufe.ts` too,
 * though the new pipeline writes `indoor` directly during extraction.
 *
 * Run: npx tsx scripts/augment-indoor-flag.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Occupation } from "@azuki/shared";

const INDOOR_WORKPLACE_RE =
	/Büroräumen|Werkstätten|Produktionshallen|Verkaufsräumen|Verkaufsständen|Lagerräumen|Lagerhallen|Kühlräumen|Kühlhäusern|Küchen|Backstube|Gasträumen|Praxisräumen|Behandlungsräumen|Klassenzimmern|Krankenhäusern|Pflegeeinrichtungen|Hotels|Restaurants|Friseursalons|Verwaltungsgebäuden|Bildungseinrichtungen|Apotheken|Sporthallen|Sportstätten/i;

interface AugmentReport {
	total: number;
	indoorBefore: number;
	indoorAfter: number;
	addedFromWorkLocations: number;
}

export function augmentIndoorFlag(occupations: Occupation[]): AugmentReport {
	let indoorBefore = 0;
	let indoorAfter = 0;
	let addedFromWorkLocations = 0;

	for (const occ of occupations) {
		const existing = occ.conditions.indoor === true;
		if (existing) indoorBefore++;

		const officeOrWorkshop = occ.conditions.office || occ.conditions.workshop;
		const matchesText = INDOOR_WORKPLACE_RE.test(occ.workLocations || "");
		const newIndoor = officeOrWorkshop || matchesText;

		if (!existing && newIndoor && !officeOrWorkshop) {
			// Pure gain from the broader workLocations check (retail, kitchen, etc.)
			addedFromWorkLocations++;
		}

		occ.conditions.indoor = newIndoor;
		if (newIndoor) indoorAfter++;
	}

	return {
		total: occupations.length,
		indoorBefore,
		indoorAfter,
		addedFromWorkLocations,
	};
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const dataPath = resolve(
		fileURLToPath(import.meta.url),
		"../../backend/src/data/berufe.json",
	);
	const occupations: Occupation[] = JSON.parse(readFileSync(dataPath, "utf-8"));
	const report = augmentIndoorFlag(occupations);
	console.log(`Total records: ${report.total}`);
	console.log(`indoor=true before: ${report.indoorBefore}`);
	console.log(`indoor=true after:  ${report.indoorAfter}`);
	console.log(
		`Net gain from workLocations match (not previously office/workshop): ${report.addedFromWorkLocations}`,
	);
	writeFileSync(dataPath, JSON.stringify(occupations, null, 2));
	console.log(`\nWrote ${dataPath}`);
}
