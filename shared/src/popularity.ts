export type PopularityTier =
	| "A_anchor"
	| "B_solid"
	| "C_smallReal"
	| "D_niche"
	| "E_vanishing"
	| "F_doppelqual"
	| "G_unknown";

export type OccupationCategory =
	| "dual"
	| "schulisch"
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
