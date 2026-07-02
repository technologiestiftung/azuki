import type { Occupation } from "../types";
import {
	COMMUNICATION_SKILL_TAGS,
	CONCENTRATION_SKILL_TAGS,
	CRAFTSMANSHIP_SKILL_TAGS,
	CREATIVITY_SKILL_TAGS,
	LOGICAL_THINKING_SKILL_TAGS,
	PRECISION_SKILL_TAGS,
	STRENGTH_TO_TAGS,
} from "./predicates";

export function occupationMatchesStrength(
	strengthId: string,
	occupation: Occupation,
): boolean {
	if (strengthId === "craftsmanship") {
		return (
			occupation.conditions.manualLabor ||
			occupation.conditions.machinery ||
			CRAFTSMANSHIP_SKILL_TAGS.some((tag) => occupation.skillTags.includes(tag))
		);
	}

	if (strengthId === "precision") {
		return (
			occupation.conditions.precisionWork ||
			PRECISION_SKILL_TAGS.some((tag) => occupation.skillTags.includes(tag))
		);
	}

	if (strengthId === "concentration") {
		return CONCENTRATION_SKILL_TAGS.some((tag) =>
			occupation.skillTags.includes(tag),
		);
	}

	if (strengthId === "creativity") {
		const tags = STRENGTH_TO_TAGS[strengthId];
		return (
			tags?.some((tag) => occupation.strengthTags.includes(tag)) ||
			CREATIVITY_SKILL_TAGS.some((tag) => occupation.skillTags.includes(tag))
		);
	}

	if (strengthId === "logical-thinking") {
		const tags = STRENGTH_TO_TAGS[strengthId];
		return (
			tags?.some((tag) => occupation.strengthTags.includes(tag)) ||
			LOGICAL_THINKING_SKILL_TAGS.some((tag) =>
				occupation.skillTags.includes(tag),
			)
		);
	}

	if (strengthId === "communication") {
		const tags = STRENGTH_TO_TAGS[strengthId];
		return (
			tags?.some((tag) => occupation.strengthTags.includes(tag)) ||
			COMMUNICATION_SKILL_TAGS.some((tag) => occupation.skillTags.includes(tag))
		);
	}

	const tags = STRENGTH_TO_TAGS[strengthId];
	if (!tags?.length) {
		return false;
	}
	return tags.some((tag) => occupation.strengthTags.includes(tag));
}
