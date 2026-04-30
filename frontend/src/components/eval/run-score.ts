import type { ScoreReport, Verdict } from "@azuki/shared";

export interface RunScore {
	verdict: Verdict;
	percent: number;
}

function deriveVerdict(reports: ScoreReport[]): Verdict {
	if (reports.length === 0) {
		return "fail";
	}
	if (reports.some((r) => r.verdict === "fail")) {
		return "fail";
	}
	if (reports.some((r) => r.verdict === "concerns")) {
		return "concerns";
	}
	if (reports.every((r) => r.verdict === "strong-pass")) {
		return "strong-pass";
	}
	return "pass";
}

export function aggregateRunScore(
	reports: Record<string, ScoreReport>,
): RunScore {
	const all = Object.values(reports);
	if (all.length === 0) {
		return { verdict: "fail", percent: 0 };
	}
	const sum = all.reduce((acc, r) => acc + r.percent, 0);
	const percent = Math.round(sum / all.length);
	return {
		verdict: deriveVerdict(all),
		percent,
	};
}
