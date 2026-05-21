import data from "../data/availability-by-state.json";

export type Bundesland =
	| "Baden-Württemberg"
	| "Bayern"
	| "Berlin"
	| "Brandenburg"
	| "Bremen"
	| "Hamburg"
	| "Hessen"
	| "Mecklenburg-Vorpommern"
	| "Niedersachsen"
	| "Nordrhein-Westfalen"
	| "Rheinland-Pfalz"
	| "Saarland"
	| "Sachsen"
	| "Sachsen-Anhalt"
	| "Schleswig-Holstein"
	| "Thüringen";

export const BUNDESLAENDER: Bundesland[] = [
	"Baden-Württemberg",
	"Bayern",
	"Berlin",
	"Brandenburg",
	"Bremen",
	"Hamburg",
	"Hessen",
	"Mecklenburg-Vorpommern",
	"Niedersachsen",
	"Nordrhein-Westfalen",
	"Rheinland-Pfalz",
	"Saarland",
	"Sachsen",
	"Sachsen-Anhalt",
	"Schleswig-Holstein",
	"Thüringen",
];

export function isBundesland(s: string): s is Bundesland {
	return (BUNDESLAENDER as readonly string[]).includes(s);
}

type StateCounts = Partial<Record<Bundesland, number>>;
const AVAILABILITY = data as Record<string, StateCounts>;

/** Annual trainee count for occupation in a given state, 0 if no record. */
export function traineeCountInState(
	occupationId: number,
	state: Bundesland,
): number {
	return AVAILABILITY[String(occupationId)]?.[state] ?? 0;
}

/** Sum across multiple states (e.g. Berlin+Brandenburg as a metro area). */
export function traineeCountAcrossStates(
	occupationId: number,
	states: readonly Bundesland[],
): number {
	let total = 0;
	for (const s of states) total += traineeCountInState(occupationId, s);
	return total;
}

/** True if any record exists (covers parent-rollup berufe correctly). */
export function hasAvailabilityData(occupationId: number): boolean {
	return AVAILABILITY[String(occupationId)] !== undefined;
}
