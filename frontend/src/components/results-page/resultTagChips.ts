import {
	getOccupationTagDefinition,
	OCCUPATION_TAGS,
	type MatchedOccupation,
} from "@azuki/shared";
import type { FilterOccupationTypeTagChip } from "../filter-bottom-sheet/FilterBottomSheet";

/** Supports match results cached before occupationTag was added to the API. */
export function getOccupationTagId(occupation: MatchedOccupation): string {
	return occupation.occupationTag || "sonstige";
}

/** Filter chips for tags present in the current recommendation list. */
export function buildResultTagChips(
	occupations: MatchedOccupation[],
): FilterOccupationTypeTagChip[] {
	const presentIds = new Set(
		occupations.map((occupation) => getOccupationTagId(occupation)),
	);

	return OCCUPATION_TAGS.filter((tag) => presentIds.has(tag.id)).map((tag) => ({
		id: tag.id,
		label: tag.label,
	}));
}

export function getOccupationTagLabel(tagId: string): string {
	return getOccupationTagDefinition(tagId)?.label ?? tagId;
}
