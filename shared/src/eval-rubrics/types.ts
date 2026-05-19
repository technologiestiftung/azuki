export type Verdict = "strong-pass" | "pass" | "concerns" | "fail";

export interface ScoreReport {
	verdict: Verdict;
	percent: number;
	tierSCount: number;
	tierACount: number;
	tierCCount: number;
	hasError: boolean;
}
