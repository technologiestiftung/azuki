import type { PersonaId, ScoreReport, Verdict } from "@azuki/shared";

export interface RunScore {
	verdict: Verdict;
	passedCount: number;
	totalCount: number;
	percent: number;
}

function deriveVerdict(reports: ScoreReport[]): Verdict {
	if (reports.some((r) => r.verdict === "fail")) {
		return "fail";
	}
	if (reports.some((r) => r.verdict === "concerns")) {
		return "concerns";
	}
	if (reports.every((r) => r.verdict === "pass")) {
		return "pass";
	}
	return "fail";
}

export function aggregateRunScore(
	reports: Record<PersonaId, ScoreReport>,
): RunScore {
	const all = Object.values(reports);
	const passedCount = all.reduce((sum, r) => sum + r.passedCount, 0);
	const totalCount = all.reduce((sum, r) => sum + r.totalCount, 0);
	const percent =
		totalCount === 0 ? 0 : Math.round((passedCount / totalCount) * 100);
	return {
		verdict: deriveVerdict(all),
		passedCount,
		totalCount,
		percent,
	};
}
