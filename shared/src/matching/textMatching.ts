import type { Occupation } from "../types";

export function getOccupationSearchTerms(occupation: Occupation): string[] {
	return [
		...occupation.interestKeywords,
		...occupation.skillTags,
		...occupation.strengthTags,
		...(occupation.taskBullets ?? []),
		occupation.shortDescription,
		occupation.name,
	]
		.filter((term): term is string => Boolean(term))
		.map((term) => term.toLowerCase());
}

export function scoreCustomTextMatch(
	text: string,
	occupation: Occupation,
): number {
	const tokens = text
		.toLowerCase()
		.split(/[\s,.;:-]+/)
		.filter((token) => token.length >= 4);
	if (tokens.length === 0) {
		return 0;
	}

	const occupationTerms = getOccupationSearchTerms(occupation);

	let hits = 0;
	for (const token of tokens) {
		if (occupationTerms.some((term) => term.includes(token))) {
			hits++;
		}
	}
	return hits > 0 ? Math.min(hits, 2) : 0;
}
