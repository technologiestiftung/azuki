import type { Persona } from "@azuki/shared";

export type RubricTier = "S" | "A" | "C";

export function getRubricTier(
	occupationId: number,
	persona: Persona,
): RubricTier | undefined {
	if (persona.tierC.includes(occupationId)) {
		return "C";
	}
	if (persona.tierS.includes(occupationId)) {
		return "S";
	}
	if (persona.tierA.includes(occupationId)) {
		return "A";
	}
	return undefined;
}
