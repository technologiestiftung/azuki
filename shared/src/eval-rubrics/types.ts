import type { FinalEntry } from "../eval-types";
import type { PopularityTier } from "../popularity";

export type Verdict = "strong-pass" | "pass" | "concerns" | "fail";

export interface CriterionResult {
	name: string;
	passed: boolean;
	details: string;
	hardFail?: boolean;
}

export interface Criterion {
	name: string;
	hardFail?: boolean;
	check: (
		top8: FinalEntry[],
		top5: FinalEntry[],
		getTier: (id: number) => PopularityTier | undefined,
	) => CriterionResult;
}

export interface PersonaRubric {
	tierS: number[];
	tierA: number[];
	tierC: number[];
	criteria: Criterion[];
}

export interface ScoreReport {
	verdict: Verdict;
	criteria: CriterionResult[];
	passedCount: number;
	totalCount: number;
}
