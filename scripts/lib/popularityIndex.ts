import {
	normName,
	type PopularityRecord,
	type PopularityTier,
} from "@azuki/shared";

export interface CatalogEntry {
	id: number;
	name: string;
	salaryKnown: boolean;
	degreeStats: unknown;
}

export interface DestatisNameRow {
	name: string;
	bundesland: string;
	students: number;
}

const PARENT_SEPARATOR = " - ";
const DOPPELQUAL_MARKER = "doppelt qualifizierende";
const NATIONAL = "Deutschland";

export function collapseGenderPairs(name: string): string {
	return name
		.replace(/(\p{L}+)mann\/\1frau/gu, "$1mann")
		.replace(/(\p{L}+)er\/\1in\b/gu, "$1er");
}

export function matchKey(name: string): string {
	return normName(collapseGenderPairs(name));
}

export function tierForCount(count: number): PopularityTier {
	if (count >= 5000) return "A_anchor";
	if (count >= 1000) return "B_solid";
	if (count >= 200) return "C_smallReal";
	if (count >= 50) return "D_niche";
	return "E_vanishing";
}

function sumByMatchKey(
	entries: Iterable<readonly [string, number]>,
): Map<string, number> {
	const sums = new Map<string, number>();
	for (const [name, count] of entries) {
		const key = matchKey(name);
		sums.set(key, (sums.get(key) ?? 0) + count);
	}
	return sums;
}

export function buildPopularityIndex(
	catalog: CatalogEntry[],
	dazubiNationalTotals: Map<string, number>,
	destatisRows: DestatisNameRow[],
): PopularityRecord[] {
	const dazubi = sumByMatchKey(dazubiNationalTotals);
	const destatis = sumByMatchKey(
		destatisRows
			.filter((r) => r.bundesland === NATIONAL)
			.map((r) => [r.name, r.students] as const),
	);

	return catalog.map((entry): PopularityRecord => {
		const base = {
			id: entry.id,
			name: entry.name,
			salaryKnown: entry.salaryKnown,
			hasDegreeStats: entry.degreeStats != null,
		};

		const direct = dazubi.get(matchKey(entry.name));
		const parentName = entry.name.split(PARENT_SEPARATOR)[0];
		const parent =
			parentName !== entry.name ? dazubi.get(matchKey(parentName)) : undefined;
		const contracts = direct ?? parent;
		if (contracts !== undefined) {
			return {
				...base,
				category: "dual",
				dazubiContracts: contracts,
				dazubiMatchType: direct !== undefined ? "direct" : "parent",
				popularityTier: tierForCount(contracts),
			};
		}

		// matchKey drops the bracketed qualifier, so the schulische namesake's Destatis count would match.
		if (entry.name.includes(DOPPELQUAL_MARKER)) {
			return {
				...base,
				category: "doppelqual",
				dazubiContracts: null,
				dazubiMatchType: "none",
				popularityTier: "F_doppelqual",
			};
		}

		const students = destatis.get(matchKey(entry.name));
		if (students !== undefined) {
			return {
				...base,
				category: "schulisch",
				dazubiContracts: null,
				dazubiMatchType: "none",
				schulischeStudents: students,
				popularityTier: tierForCount(students),
			};
		}

		return {
			...base,
			category: "schulisch_or_other",
			dazubiContracts: null,
			dazubiMatchType: "none",
			popularityTier: "G_unknown",
		};
	});
}
