import type {
	EvalSnapshot,
	FinalEntry,
	Persona,
	ScoreReport,
	Verdict,
} from "@azuki/shared";

const TOP_8 = 8;
const MAX_POINTS = 16;
const POINTS_TIER_S = 2;
const POINTS_TIER_A = 1;

function isError(r: { error?: string }): boolean {
	return "error" in r && typeof (r as { error: string }).error === "string";
}

function deriveVerdict(percent: number, tierCInTop8: number): Verdict {
	if (tierCInTop8 > 0) {
		return "fail";
	}
	if (percent < 50) {
		return "fail";
	}
	if (percent < 80) {
		return "concerns";
	}
	if (percent < 100) {
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
				tierSCount: 0,
				tierACount: 0,
				tierCCount: 0,
				hasError: true,
			};
			continue;
		}
		const final = (result as { final: FinalEntry[] }).final;
		const top8 = final.slice(0, TOP_8);
		const tierSSet = new Set(persona.tierS);
		const tierASet = new Set(persona.tierA);
		const tierCSet = new Set(persona.tierC);
		let tierSCount = 0;
		let tierACount = 0;
		let tierCCount = 0;
		for (const entry of top8) {
			if (tierCSet.has(entry.id)) {
				tierCCount += 1;
			} else if (tierSSet.has(entry.id)) {
				tierSCount += 1;
			} else if (tierASet.has(entry.id)) {
				tierACount += 1;
			}
		}
		const points = tierSCount * POINTS_TIER_S + tierACount * POINTS_TIER_A;
		const percent = Math.round((points / MAX_POINTS) * 100);
		out[persona.id] = {
			verdict: deriveVerdict(percent, tierCCount),
			percent,
			tierSCount,
			tierACount,
			tierCCount,
			hasError: false,
		};
	}
	return out;
}
