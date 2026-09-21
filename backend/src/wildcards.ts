import {
	type Occupation,
	type MatchedOccupation,
	formatOccupationDisplayName,
	resolveOccupationShortDescription,
	WILDCARD_POOL_OCCUPATION_IDS,
} from "@azuki/shared";
import { occupationMatchMeta } from "./occupationMeta.js";

/**
 * Picks up to `count` random occupations from the fixed wildcard pool,
 * excluding anything already present in the caller's match/shared-match result
 */
export function pickWildcardOccupations(
	occupations: Occupation[],
	excludeIds: Set<number>,
	count = 5,
): Occupation[] {
	const byId = new Map(occupations.map((o) => [o.id, o]));
	const candidates = WILDCARD_POOL_OCCUPATION_IDS.filter(
		(id) => !excludeIds.has(id) && byId.has(id),
	).map((id) => byId.get(id) as Occupation);

	for (let i = candidates.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[candidates[i], candidates[j]] = [candidates[j], candidates[i]];
	}

	return candidates.slice(0, count);
}

export function toWildcardMatchedOccupation(
	occupation: Occupation,
): MatchedOccupation {
	return {
		id: occupation.id,
		name: formatOccupationDisplayName(occupation.name),
		rawName: occupation.name,
		score: 0,
		images: occupation.images.slice(0, 3),
		shortDescription: resolveOccupationShortDescription(occupation),
		reasoning: "",
		salaryKnown: occupation.salaryKnown,
		salaryMonthlyMedian: occupation.salaryMonthlyMedian,
		salaryEntryKnown: occupation.salaryEntryKnown,
		salaryMonthlyEntry: occupation.salaryMonthlyEntry,
		...occupationMatchMeta(occupation),
	};
}
