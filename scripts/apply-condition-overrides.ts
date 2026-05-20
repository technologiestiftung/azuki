/**
 * Apply curated overrides to occupation `conditions` flags after fetch.
 *
 * BERUFENET's structured Bedingungen text is parsed into binary flags by
 * fetch-berufe.ts via regex matches. A handful of Berufe get tagged in
 * ways that don't match the user-facing semantics of those flags —
 * typically because the source German is ambiguous about whether something
 * happens "within one facility" or "across multiple facilities".
 *
 * Overrides are deliberate, narrow, and documented per ID. Add an entry
 * only when:
 *   1. The BERUFENET-derived flag clearly disagrees with how a user would
 *      describe the same work in plain language, AND
 *   2. Comparable Berufe in the same family carry the opposite flag (so
 *      the override aligns this Beruf with its peers, not against them).
 *
 * Runs after hydrate-fachpraktiker so that §66 children, which inherited
 * the parent's conditions before this fix existed, are also corrected here.
 *
 * Run standalone: npx tsx scripts/apply-condition-overrides.ts
 *   Reads backend/src/data/berufe.json, applies overrides in place, writes back.
 *
 * Called from fetch-berufe.ts in the normal fetch pipeline.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Occupation, WorkConditions } from "@azuki/shared";

type ConditionPatch = Partial<WorkConditions>;

const CONDITION_OVERRIDES: Array<{
	ids: number[];
	patch: ConditionPatch;
	reason: string;
}> = [
	{
		// Lagerlogistik family: BERUFENET tags "wechselnde Arbeitsorte" because
		// the Bedingungen text mentions Lagerhalle / Kühlhaus / Lagerplatz im
		// Freien / Büro. These are zones within one warehouse facility, not
		// multi-site travel. Verkäufer, Koch, Hotelfachmann — peers with the
		// same "fixed-facility, multiple zones" pattern — all carry the flag
		// as false. Berufkraftfahrer, the canonical multi-site role, uses
		// `frequentAbsence` instead. Karim's "short_distance" workValue takes
		// a -2 here that the user wouldn't expect to apply to warehouse work.
		ids: [
			27448, // Fachkraft - Lagerlogistik
			27539, // Fachlagerist/in
			4708, // Fachpraktiker/in für Lagerlogistik (§66 BBiG/§42r HwO)
		],
		patch: { changingWorkplaces: false },
		reason: "warehouse zones, not multi-site travel",
	},
	{
		// Human care/therapy/education cohort: BERUFENET's Bedingungen text
		// for these roles uses "Patientenkontakt", "Klientenkontakt", "Kontakt
		// zu Kindern" etc., none of which match fetch-berufe's
		// /Kundenkontakt/i regex. Result: 13+ obviously people-facing Berufe
		// (Logopäde, Erzieher, Pflegehelfer, Sozialassistent…) carry
		// customerContact=false, which suppresses them in the "people.b"
		// work-preference branch and inflates the apparent gap for any
		// persona who selected people-facing preferences. Surfaced by the
		// preFilter recall audit at K=60: Elina's Logopäde landed at rank
		// 224 with pref=4 (vs cutoff 10), almost entirely because of this.
		ids: [
			14616, // Assistent/in - Gesundheits- und Sozialwesen
			8779, // Ergotherapeut/in (Ausbildung)
			9162, // Erzieher/in
			9106, // Erzieher/in - Jugend- und Heimerziehung
			9598, // Eurythmielehrer/in
			9387, // Fachlehrer/in - musisch-technische Fächer
			138818, // Fachpraktiker/in für Hauswirtschaft und personenorientierte Serviceleistungen
			129985, // Fachpraktiker/in für Service in sozialen Einrichtungen (§66 child of 9031)
			14712, // Fußballtrainer/in
			30191, // Gesundheits- und Krankenpflegehelfer/in
			9077, // Haus- und Familienpfleger/in (Ausbildung)
			13778, // Heilerziehungspflegeassistent/in
			9127, // Heilerziehungspfleger/in
			9108, // Kinderdorfmutter/-vater
			59055, // Kunsttherapeut/in (Ausbildung)
			59445, // Lehrer/in - Waldorfschulen (Ausbildung)
			8764, // Logopäde/Logopädin (Ausbildung)
			15421, // Musiktherapeut/in (Ausbildung)
			135349, // Pflegeassistent/in
			132173, // Pflegefachmann/-frau (Ausbildung)
			9031, // Sozialassistent/in
			9170, // Sozialpädagogische/r Assistent/in / Kinderpfleger/in
		],
		patch: { customerContact: true },
		reason:
			"care/therapy/education role; BERUFENET uses Patienten-/Klienten-/Kinder-Kontakt, missed by Kundenkontakt regex",
	},
];

export interface OverrideReport {
	id: number;
	name: string;
	patch: ConditionPatch;
	reason: string;
}

export function applyConditionOverrides(
	occupations: Occupation[],
): OverrideReport[] {
	const occMap = new Map(occupations.map((o) => [o.id, o]));
	const report: OverrideReport[] = [];
	for (const { ids, patch, reason } of CONDITION_OVERRIDES) {
		for (const id of ids) {
			const occ = occMap.get(id);
			if (!occ) continue;
			Object.assign(occ.conditions, patch);
			report.push({ id, name: occ.name, patch, reason });
		}
	}
	return report;
}

// Standalone entry point: read berufe.json, apply overrides, write back.
if (import.meta.url === `file://${process.argv[1]}`) {
	const dataPath = resolve(
		fileURLToPath(import.meta.url),
		"../../backend/src/data/berufe.json",
	);
	const occupations: Occupation[] = JSON.parse(readFileSync(dataPath, "utf-8"));
	const report = applyConditionOverrides(occupations);
	console.log(`Applied ${report.length} condition overrides.\n`);
	for (const r of report) {
		const patchStr = Object.entries(r.patch)
			.map(([k, v]) => `${k}=${v}`)
			.join(", ");
		console.log(`  ${String(r.id).padEnd(7)} ${r.name.slice(0, 50).padEnd(50)} { ${patchStr} }  — ${r.reason}`);
	}
	writeFileSync(dataPath, JSON.stringify(occupations, null, 2));
	console.log(`\nWrote ${dataPath}`);
}
