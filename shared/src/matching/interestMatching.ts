import { INTERESTS } from "../interests";
import type { Occupation } from "../types";
import { CREATIVITY_SKILL_TAGS } from "./predicates";

const INTEREST_BY_ID = new Map(
	INTERESTS.map((interest) => [interest.id, interest]),
);

export function scoreSingleInterestMatch(
	interestId: string,
	occupation: Occupation,
): number {
	const interestDefinition = INTEREST_BY_ID.get(interestId);
	if (!interestDefinition) {
		return 0;
	}

	let score = 0;
	for (const category of interestDefinition.berufenetTags) {
		const interestIndex = occupation.interests.indexOf(category);
		if (interestIndex === 0) {
			score += 3;
		} else if (interestIndex === 1) {
			score += 2;
		} else if (interestIndex >= 2) {
			score += 1;
		} else if (
			category === "kreativ-gestaltend" &&
			CREATIVITY_SKILL_TAGS.some((tag) => occupation.skillTags.includes(tag))
		) {
			score += 1;
		}
	}

	const occupationKeywords = new Set(
		occupation.interestKeywords.map((keyword) => keyword.toLowerCase()),
	);
	let keywordHits = 0;
	for (const keyword of interestDefinition.matchKeywords) {
		if (occupationKeywords.has(keyword.toLowerCase())) {
			keywordHits++;
		}
	}
	score += Math.min(keywordHits, 3);
	return score;
}
