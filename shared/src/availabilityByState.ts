import data from "../data/availability-by-state.json";
import type { Bundesland } from "./availability";

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
	for (const s of states) {
		total += traineeCountInState(occupationId, s);
	}
	return total;
}

/** True if any record exists (covers parent-rollup berufe correctly). */
export function hasAvailabilityData(occupationId: number): boolean {
	return AVAILABILITY[String(occupationId)] !== undefined;
}
