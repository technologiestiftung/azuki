/**
 * Joins the per-state DAZUBI + Destatis fixtures against the BERUFENET
 * catalog to produce shared/data/availability-by-state.json:
 *
 *   { [occupationId]: { [bundesland]: traineeCount } }
 *
 * - DAZUBI rows match by normalized name (popularity-index.json carries
 *   the BERUFENET id ↔ DAZUBI name mapping).
 * - Destatis rows match by KldB 2010. Both sides of the join are run
 *   through normalizeKldb so the equality match shares one contract,
 *   regardless of how each source wrote its code.
 *
 * Run: npx tsx scripts/build-availability.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { isBundesland, type Bundesland } from "@azuki/shared";
import { normName } from "./normName.js";
import { normalizeKldb } from "./normalizeKldb.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const POP_INDEX = resolve(ROOT, "shared/data/popularity-index.json");
const BERUFE = resolve(ROOT, "backend/src/data/berufe.json");
const DAZUBI_FIXTURE = resolve(ROOT, "shared/data/dazubi-trainee-starts.json");
const DESTATIS_FIXTURE = resolve(ROOT, "shared/data/destatis-trainee-starts.json");
const OUT = resolve(ROOT, "shared/data/availability-by-state.json");

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
		const k = normName(r.name);
		if (!popByNormFull.has(k)) popByNormFull.set(k, []);
		popByNormFull.get(k)!.push(r.id);
		if (r.dazubiMatchType === "parent") {
			const base = r.name.split(" - ")[0];
			const bk = normName(base);
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
		const norm = normName(row.name);
		let ids = popByNormFull.get(norm);
		let viaRollup = false;
		if (!ids?.length) {
			ids = popByNormRollup.get(norm);
			if (ids?.length) viaRollup = true;
		}
		if (!ids?.length) {
			const baseNorm = normName(row.name.split(" - ")[0]);
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

function main() {
	const pop = JSON.parse(readFileSync(POP_INDEX, "utf8")) as PopRecord[];
	const berufe = JSON.parse(readFileSync(BERUFE, "utf8")) as Beruf[];
	const dazubi = JSON.parse(readFileSync(DAZUBI_FIXTURE, "utf8")) as DazubiRow[];
	const destatis = JSON.parse(readFileSync(DESTATIS_FIXTURE, "utf8")) as DestatisRow[];

	console.log(`  ${dazubi.length} DAZUBI rows, ${destatis.length} Destatis rows`);

	const { availability, stats } = buildAvailability(berufe, pop, dazubi, destatis);

	console.log(
		`  DAZUBI matched: ${stats.dazubiMatched} (${stats.dazubiRollupMatched} via parent-rollup), unmatched: ${stats.dazubiUnmatched}`,
	);
	if (stats.dazubiUnmatched > 0) {
		console.log("    examples:", stats.dazubiUnmatchedNames.slice(0, 5));
	}
	console.log(
		`  Destatis matched (row-level): ${stats.destatisMatched}, unmatched: ${stats.destatisUnmatched}`,
	);

	const idsWithAny = Object.keys(availability).length;
	const idsWithBeBb = Object.values(availability).filter(
		(s) => (s.Berlin ?? 0) + (s.Brandenburg ?? 0) > 0,
	).length;
	const catalogSize = berufe.length;
	const withoutData = catalogSize - idsWithAny;
	const pct = (n: number) => ((100 * n) / catalogSize).toFixed(1);
	console.log(`\nCatalog: ${catalogSize} berufe`);
	console.log(`  with availability data: ${idsWithAny} (${pct(idsWithAny)}%)`);
	console.log(
		`  without data (will pass the regional filter unverified): ${withoutData} (${pct(withoutData)}%)`,
	);
	console.log(`  with ≥1 trainee in Berlin or Brandenburg: ${idsWithBeBb}`);

	mkdirSync(dirname(OUT), { recursive: true });
	writeFileSync(OUT, JSON.stringify(availability, null, 2) + "\n");
	console.log(`\nWrote ${OUT}`);
}

// Run main() only when invoked as a CLI, not when imported from a test.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
	main();
}
