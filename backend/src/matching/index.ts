import type { Occupation, UserProfile } from "@azuki/shared";
import { buildSalaryBands, scoreOccupation } from "./score/index.js";

// Number of Berufe preFilter forwards to the LLM ranker. K=80 was tested
// against K=40 (Sonnet 4.6, all 7 personas, 2026-05-20) and produced a
// net regression: aggregate Tier S picks dropped from 18 → 13 across
// personas. LLM precision degrades with more candidates more than
// preFilter recall improves. Reverted to 40.
export const PREFILTER_TOP_K = 40;

export interface ScoredOccupation {
	occupation: Occupation;
	score: number;
}

export function preFilter(
	occupations: Occupation[],
	profile: UserProfile,
	topN: number = 30,
): ScoredOccupation[] {
	const salaryBands = buildSalaryBands(occupations);
	const scored: ScoredOccupation[] = occupations.map((occupation) => ({
		occupation,
		score: scoreOccupation(occupation, profile, salaryBands),
	}));

	scored.sort((a, b) => b.score - a.score);

	return scored.slice(0, topN);
}
