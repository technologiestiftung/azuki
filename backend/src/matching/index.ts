import type { Bundesland, Occupation, UserProfile } from "@azuki/shared";
import { hasAvailabilityData, traineeCountAcrossStates } from "@azuki/shared";
import { buildSalaryBands, scoreOccupation } from "./score/index.js";

export interface ScoredOccupation {
	occupation: Occupation;
	score: number;
}

/**
 * The metro region this product serves. Beruf availability is gated on
 * trainee start counts across these states combined.
 */
const SERVICE_REGION: readonly Bundesland[] = ["Berlin", "Brandenburg"];

/** Minimum annual trainee starts in SERVICE_REGION for a beruf to clear the filter. */
const MIN_TRAINEES = 5;

/**
 * Drop berufe that don't reach MIN_TRAINEES new contracts/enrollments
 * per year across the service region.
 *
 * Berufe with no availability record (Fachpraktiker, G_unknown, anything
 * DAZUBI+Destatis don't cover) are conservatively kept — absence of data
 * is not the same as unavailable.
 */
export function filterByRegionalAvailability(
	occupations: Occupation[],
): Occupation[] {
	return occupations.filter((o) => {
		if (!hasAvailabilityData(o.id)) return true;
		return traineeCountAcrossStates(o.id, SERVICE_REGION) >= MIN_TRAINEES;
	});
}

export function preFilter(
	occupations: Occupation[],
	profile: UserProfile,
	topN: number = 30,
): ScoredOccupation[] {
	const candidates = filterByRegionalAvailability(occupations);

	const salaryBands = buildSalaryBands(candidates);
	const scored: ScoredOccupation[] = candidates.map((occupation) => ({
		occupation,
		score: scoreOccupation(occupation, profile, salaryBands),
	}));

	scored.sort((a, b) => b.score - a.score);

	return scored.slice(0, topN);
}
