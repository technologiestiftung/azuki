import {
	getOccupationTagDefinition,
	OCCUPATION_TAGS,
	type MatchedOccupation,
	type OccupationTagId,
} from "@azuki/shared";
import type { FilterOccupationTypeTagChip } from "../filter-bottom-sheet/OccupationTagsFilterBottomSheet";

export function getOccupationTagId(
	occupation: MatchedOccupation,
): OccupationTagId {
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
