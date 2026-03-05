import type { Occupation, UserProfile } from "@azuki/shared";
import { buildSalaryBands, scoreOccupation } from "./score/index.js";

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
