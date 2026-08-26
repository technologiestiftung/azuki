import type {
	EvalSnapshot,
	FinalEntry,
	Persona,
	ScoreReport,
	Verdict,
} from "@azuki/shared";
import {
	evalMaxPoints,
	EVAL_POINTS_TIER_A,
	EVAL_POINTS_TIER_S,
	EVAL_TOP_N,
	EVAL_VERDICT_CONCERNS_BELOW,
	EVAL_VERDICT_FAIL_BELOW,
	EVAL_VERDICT_PASS_BELOW,
} from "@azuki/shared";

function isError(r: { error?: string }): boolean {
	return "error" in r && typeof (r as { error: string }).error === "string";
}

function deriveVerdict(percent: number, tierCInTopFinal: number): Verdict {
	if (tierCInTopFinal > 0) {
		return "fail";
	}
	if (percent < EVAL_VERDICT_FAIL_BELOW) {
		return "fail";
	}
	if (percent < EVAL_VERDICT_CONCERNS_BELOW) {
		return "concerns";
	}
	if (percent < EVAL_VERDICT_PASS_BELOW) {
		return "pass";
	}
	return "strong-pass";
}

export function scoreSnapshot(
	snapshot: EvalSnapshot,
	personas: Persona[],
): Record<string, ScoreReport> {
	const out: Record<string, ScoreReport> = {};
	for (const persona of personas) {
		const result = snapshot.results[persona.id];
		if (!result || isError(result as { error?: string })) {
			out[persona.id] = {
				verdict: "fail",
				percent: 0,
				points: 0,
				maxPoints: 0,
				resultCount: 0,
				tierSCount: 0,
				tierACount: 0,
				tierCCount: 0,
				hasError: true,
			};
			continue;
		}
		const final = (result as { final: FinalEntry[] }).final;
		const topFinal = final.slice(0, EVAL_TOP_N);
		const tierSSet = new Set(persona.tierS);
		const tierASet = new Set(persona.tierA);
		const tierCSet = new Set(persona.tierC);
		let tierSCount = 0;
		let tierACount = 0;
		let tierCCount = 0;
		for (const entry of topFinal) {
			if (tierCSet.has(entry.id)) {
				tierCCount += 1;
			} else if (tierSSet.has(entry.id)) {
				tierSCount += 1;
			} else if (tierASet.has(entry.id)) {
				tierACount += 1;
			}
		}
		const points =
			tierSCount * EVAL_POINTS_TIER_S + tierACount * EVAL_POINTS_TIER_A;
		const maxPoints = evalMaxPoints(
			persona.tierS.length,
			persona.tierA.length,
			topFinal.length,
		);
		const percent =
			maxPoints === 0 ? 0 : Math.round((points / maxPoints) * 100);
		out[persona.id] = {
			verdict: deriveVerdict(percent, tierCCount),
			percent,
			points,
			maxPoints,
			resultCount: topFinal.length,
			tierSCount,
			tierACount,
			tierCCount,
			hasError: false,
		};
	}
	return out;
}
