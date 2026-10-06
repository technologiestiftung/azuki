/**
 * Joins the per-state DAZUBI rows and the Destatis fixture against the
 * BERUFENET catalog to produce shared/data/availability-by-state.json:
 *
 *   { [occupationId]: { [bundesland]: traineeCount } }
 *
 * - DAZUBI rows match by `matchKey`, the same key the popularity index uses
 *   (popularity-index.json carries the BERUFENET id ↔ DAZUBI name mapping).
 * - Destatis rows match by KldB 2010. Both sides of the join are run
 *   through normalizeKldb so the equality match shares one contract,
 *   regardless of how each source wrote its code.
 *
 * Called by scripts/build-dazubi-data.ts.
 */

import { isBundesland, type Bundesland } from "@azuki/shared";
import { normalizeKldb } from "./normalizeKldb.js";
import { matchKey } from "./lib/popularityIndex.js";

export interface PopRecord {
	id: number;
	name: string;
	dazubiContracts: number | null;
	dazubiMatchType: "direct" | "parent" | "none";
}
export interface Beruf {
	id: number;
	name: string;
	germanOccupationCode: string | null;
}
export interface DazubiRow {
	bundesland: string;
	name: string;
	anfaenger: number;
}
export interface DestatisRow {
	germanOccupationCode: string;
	bundesland: string;
	students: number;
}

export interface BuildAvailabilityStats {
	dazubiMatched: number;
	/** Subset of dazubiMatched that hit only via parent-rollup heuristic. */
	dazubiRollupMatched: number;
	dazubiUnmatched: number;
	dazubiUnmatchedNames: string[];
	destatisMatched: number;
	destatisUnmatched: number;
}

export interface BuildAvailabilityResult {
	availability: Record<number, Partial<Record<Bundesland, number>>>;
	stats: BuildAvailabilityStats;
}

/**
 * Pure join of catalog + popularity index + DAZUBI + Destatis rows
 * into the per-occupation per-state trainee count map. No I/O.
 */
export function buildAvailability(
	berufe: Beruf[],
	pop: PopRecord[],
	dazubi: DazubiRow[],
	destatis: DestatisRow[],
): BuildAvailabilityResult {
	// Two maps distinguish exact DAZUBI name matches from parent rollups. For
	// example, DAZUBI may report only "Aufbereitungsmechaniker/-in", while
	// BERUFENET has child records like "Aufbereitungsmechaniker/in - Braunkohle".
	// Only records already marked as parent matches are indexed by their base name,
	// so a direct record like "Anlagenmechaniker/in - Sanitär..." does not silently
	// absorb counts from a broad "Anlagenmechaniker/-in" DAZUBI row.
	const popByNormFull = new Map<string, number[]>();
	const popByNormRollup = new Map<string, number[]>();
	for (const r of pop) {
		const k = matchKey(r.name);
		if (!popByNormFull.has(k)) popByNormFull.set(k, []);
		popByNormFull.get(k)!.push(r.id);
		if (r.dazubiMatchType === "parent") {
			const base = r.name.split(" - ")[0];
			const bk = matchKey(base);
			if (bk !== k) {
				if (!popByNormRollup.has(bk)) popByNormRollup.set(bk, []);
				popByNormRollup.get(bk)!.push(r.id);
			}
		}
	}

	const idsByOccupationCode = new Map<string, number[]>();
	for (const b of berufe) {
		const code = normalizeKldb(b.germanOccupationCode);
		if (!code) continue;
		if (!idsByOccupationCode.has(code)) idsByOccupationCode.set(code, []);
		idsByOccupationCode.get(code)!.push(b.id);
	}

	const availability: Record<number, Partial<Record<Bundesland, number>>> = {};

	let dazubiMatched = 0;
	let dazubiRollupMatched = 0;
	let dazubiUnmatched = 0;
	const dazubiUnmatchedNames = new Set<string>();
	for (const row of dazubi) {
		if (!isBundesland(row.bundesland)) continue;
		const norm = matchKey(row.name);
		const directIds = popByNormFull.get(norm) ?? [];
		const rollupIds = popByNormRollup.get(norm) ?? [];
		let ids: number[] | undefined = [...directIds, ...rollupIds];
		let viaRollup = directIds.length === 0 && rollupIds.length > 0;
		if (!ids?.length) {
			const baseNorm = matchKey(row.name.split(" - ")[0]);
			ids = popByNormFull.get(baseNorm) ?? popByNormRollup.get(baseNorm);
			if (ids?.length) viaRollup = true;
		}
		if (!ids?.length) {
			dazubiUnmatched++;
			dazubiUnmatchedNames.add(row.name);
			continue;
		}
		dazubiMatched++;
		if (viaRollup) dazubiRollupMatched++;
		for (const id of ids) {
			availability[id] ??= {};
			availability[id][row.bundesland] =
				(availability[id][row.bundesland] ?? 0) + row.anfaenger;
		}
	}

	let destatisMatched = 0;
	let destatisUnmatched = 0;
	for (const row of destatis) {
		if (!isBundesland(row.bundesland)) continue;
		const code = normalizeKldb(row.germanOccupationCode);
		const ids = code ? idsByOccupationCode.get(code) : undefined;
		if (!ids?.length) {
			destatisUnmatched++;
			continue;
		}
		destatisMatched++;
		for (const id of ids) {
			availability[id] ??= {};
			availability[id][row.bundesland] =
				(availability[id][row.bundesland] ?? 0) + row.students;
		}
	}

	return {
		availability,
		stats: {
			dazubiMatched,
			dazubiRollupMatched,
			dazubiUnmatched,
			dazubiUnmatchedNames: [...dazubiUnmatchedNames],
			destatisMatched,
			destatisUnmatched,
		},
	};
}
