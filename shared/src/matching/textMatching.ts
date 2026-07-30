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

function tokenize(text: string): string[] {
	return text
		.toLowerCase()
		.split(/[^a-zäöüß0-9]+/i)
		.filter((token) => token.length >= 4);
}

/** Exact or prefix token match (avoids "tieren"∈"montieren"). */
function termMatchesToken(term: string, token: string): boolean {
	return tokenize(term).some(
		(word) => word === token || word.startsWith(token),
	);
}

export function scoreCustomTextMatch(
	text: string,
	occupation: Occupation,
): number {
	const tokens = tokenize(text);
	if (tokens.length === 0) {
		return 0;
	}

	const occupationTerms = getOccupationSearchTerms(occupation);

	let hits = 0;
	for (const token of tokens) {
		if (occupationTerms.some((term) => termMatchesToken(term, token))) {
			hits++;
		}
	}
	return hits > 0 ? Math.min(hits, 2) : 0;
}
