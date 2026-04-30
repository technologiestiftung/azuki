import type {
	CriterionResult,
	EvalSnapshot,
	PersonaId,
	PersonaRubric,
	PopularityTier,
	ScoreReport,
	Verdict,
	FinalEntry,
} from "@azuki/shared";

const TOP_8 = 8;
const TOP_5 = 5;

function isError(r: { error?: string }): boolean {
	return "error" in r && typeof (r as { error: string }).error === "string";
}

function deriveVerdict(criteria: CriterionResult[]): Verdict {
	if (criteria.length === 0) {
		return "fail";
	}
	const anyHardFail = criteria.some((c) => c.hardFail && !c.passed);
	if (anyHardFail) {
		return "fail";
	}
	const allPassed = criteria.every((c) => c.passed);
	if (allPassed) {
		return "pass"; // "strong-pass" is reserved for when reasoning-text checks land later
	}
	return "concerns";
}

export function scoreSnapshot(
	snapshot: EvalSnapshot,
	rubrics: Record<PersonaId, PersonaRubric>,
	getTier: (id: number) => PopularityTier | undefined,
): Record<PersonaId, ScoreReport> {
	const out = {} as Record<PersonaId, ScoreReport>;
	for (const personaId of Object.keys(rubrics) as PersonaId[]) {
		const result = snapshot.results[personaId];
		if (!result || isError(result as { error?: string })) {
			out[personaId] = {
				verdict: "fail",
				criteria: [],
				passedCount: 0,
				totalCount: 0,
			};
			continue;
		}
		const final = (result as { final: FinalEntry[] }).final;
		const top8 = final.slice(0, TOP_8);
		const top5 = final.slice(0, TOP_5);
		const rubric = rubrics[personaId];
		const criteria: CriterionResult[] = rubric.criteria.map((c) =>
			c.check(top8, top5, getTier),
		);
		const passedCount = criteria.filter((c) => c.passed).length;
		out[personaId] = {
			verdict: deriveVerdict(criteria),
			criteria,
			passedCount,
			totalCount: criteria.length,
		};
	}
	return out;
}
