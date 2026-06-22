import type { Bundesland, Occupation, UserProfile } from "@azuki/shared";
import { hasAvailabilityData, traineeCountAcrossStates } from "@azuki/shared";
import { buildSalaryBands, scoreOccupation } from "./score/index.js";

// Number of Berufe preFilter forwards to the LLM ranker. Set after a
// three-model K sweep on v3 prompt + Hinweise context (Sonnet 4.6,
// Opus 4.6, Gemini 3.5 Flash; all 7 personas; 2026-05-20; rubric =
// S×2+A across personas):
//   k=20: 44.0 / 49.0 / 38.0
//   k=40: 56.0 / 55.0 / 41.5
//   k=60: 57.5 / 59.0 / 40.0  ← peak for Sonnet & Opus
//   k=80: 57.5 / 58.5 / 37.5
// K=60 is the sweet spot for the strong models; Gemini Flash gets
// distracted by the wider menu and peaks at K=40. Karim is the swing
// persona — Tier-S items he matches sit in the rank-40-to-60 band of
// preFilter, so smaller K systematically misses them.
export const PREFILTER_TOP_K = 60;
export const FINAL_MATCH_COUNT = 20;

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
		if (!hasAvailabilityData(o.id)) {
			return true;
		}
		return traineeCountAcrossStates(o.id, SERVICE_REGION) >= MIN_TRAINEES;
	});
}

export function preFilter(
	occupations: Occupation[],
	profile: UserProfile,
	topN: number = PREFILTER_TOP_K,
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
