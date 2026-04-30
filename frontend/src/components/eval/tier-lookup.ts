import type { PersonaRubric } from "@azuki/shared";

export type RubricTier = "S" | "A" | "C";

export function getRubricTier(
	occupationId: number,
	rubric: PersonaRubric,
): RubricTier | undefined {
	if (rubric.tierS.includes(occupationId)) {
		return "S";
	}
	if (rubric.tierA.includes(occupationId)) {
		return "A";
	}
	if (rubric.tierC.includes(occupationId)) {
		return "C";
	}
	return undefined;
}
