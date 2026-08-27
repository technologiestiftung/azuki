export type Verdict = "strong-pass" | "pass" | "concerns" | "fail";

export interface ScoreReport {
	verdict: Verdict;
	percent: number;
	points: number;
	maxPoints: number;
	/** How many occupations the ranker returned; maxPoints grades only these. */
	resultCount: number;
	tierSCount: number;
	tierACount: number;
	tierCCount: number;
	hasError: boolean;
}
