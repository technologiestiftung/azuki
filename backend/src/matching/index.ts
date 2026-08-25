import type { Bundesland, Occupation, UserProfile } from "@azuki/shared";
import { hasAvailabilityData, traineeCountAcrossStates } from "@azuki/shared";
import { buildSalaryBands, scoreOccupation } from "./score/index.js";
import { resolvePreferredJobs } from "./resolvePreferredJobs.js";

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
 * Berufe with no availability record (G_unknown, anything DAZUBI+Destatis
 * don't cover) are conservatively kept — absence of data is not the same
 * as unavailable.
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

// Cap injections so vague keywords (e.g. "Pflege") cannot rewrite the shortlist.
// A named Beruf is injected even when it collides with a No-Go; the score keeps
// the penalty, so it enters the shortlist ranked honestly low.
const MAX_PREFERRED_SHORTLIST_INJECTIONS = 5;

function injectPreferredJobsIntoShortlist(
	shortlist: ScoredOccupation[],
	allScored: ScoredOccupation[],
	profile: UserProfile,
): ScoredOccupation[] {
	const preferredJobs = profile.preferredJobs ?? [];
	if (preferredJobs.length === 0) {
		return shortlist;
	}

	const occupations = allScored.map((entry) => entry.occupation);
	const resolved = resolvePreferredJobs(preferredJobs, occupations);
	if (resolved.length === 0) {
		return shortlist;
	}

	const scoredById = new Map(
		allScored.map((entry) => [entry.occupation.id, entry]),
	);
	const shortlistIds = new Set(shortlist.map((entry) => entry.occupation.id));
	const result = [...shortlist];
	const injectedIds = new Set<number>();

	for (const match of resolved) {
		if (injectedIds.size >= MAX_PREFERRED_SHORTLIST_INJECTIONS) {
			break;
		}
		const occupationId = match.occupation.id;
		if (shortlistIds.has(occupationId)) {
			continue;
		}

		const scoredEntry = scoredById.get(occupationId);
		if (!scoredEntry) {
			continue;
		}

		// An injected Beruf is usually the lowest-scored entry in the shortlist,
		// so it has to be excluded here or the next injection evicts it again.
		let lowestIdx = -1;
		for (let i = 0; i < result.length; i++) {
			if (injectedIds.has(result[i].occupation.id)) {
				continue;
			}
			if (lowestIdx === -1 || result[i].score < result[lowestIdx].score) {
				lowestIdx = i;
			}
		}
		if (lowestIdx === -1) {
			break;
		}

		shortlistIds.delete(result[lowestIdx].occupation.id);
		result[lowestIdx] = scoredEntry;
		shortlistIds.add(occupationId);
		injectedIds.add(occupationId);
	}

	result.sort((a, b) => b.score - a.score);
	return result;
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

	const shortlist = scored.slice(0, topN);
	return injectPreferredJobsIntoShortlist(shortlist, scored, profile);
}
