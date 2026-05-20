import data from "../data/popularity-index.json";

export type PopularityTier =
	| "A_anchor"
	| "B_solid"
	| "C_smallReal"
	| "D_niche"
	| "E_vanishing"
	| "F_fachpraktiker"
	| "F_doppelqual"
	| "G_unknown";

export type OccupationCategory =
	| "dual"
	| "schulisch"
	| "fachpraktiker"
	| "doppelqual"
	| "schulisch_or_other";

export type DazubiMatchType = "direct" | "parent" | "none";

export interface PopularityRecord {
	id: number;
	name: string;
	category: OccupationCategory;
	dazubiContracts: number | null;
	dazubiMatchType: DazubiMatchType;
	schulischeStudents?: number | null;
	salaryKnown: boolean;
	hasDegreeStats: boolean;
	popularityTier: PopularityTier;
}

export const POPULARITY_INDEX: PopularityRecord[] = data as PopularityRecord[];

let tierMap: Map<number, PopularityTier> | null = null;
let recordMap: Map<number, PopularityRecord> | null = null;

export function getPopularityTier(id: number): PopularityTier | undefined {
	if (tierMap === null) {
		tierMap = new Map(POPULARITY_INDEX.map((r) => [r.id, r.popularityTier]));
	}
	return tierMap.get(id);
}

export function getPopularityRecord(id: number): PopularityRecord | undefined {
	if (recordMap === null) {
		recordMap = new Map(POPULARITY_INDEX.map((r) => [r.id, r]));
	}
	return recordMap.get(id);
}
