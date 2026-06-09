import type { MatchedOccupation } from "@azuki/shared";
import type { OccupationTagsFilterState } from "../../filter-bottom-sheet/OccupationTagsFilterBottomSheet";
import { getOccupationTagId } from "./resultTagChips";

export function applyOccupationFilters(
	occupations: MatchedOccupation[],
	{
		filters,
		showFavoritesOnly,
		favoriteIds,
	}: {
		filters: OccupationTagsFilterState;
		showFavoritesOnly: boolean;
		favoriteIds: Set<number>;
	},
): MatchedOccupation[] {
	let filtered = occupations;

	if (showFavoritesOnly) {
		filtered = filtered.filter((occupation) => favoriteIds.has(occupation.id));
	}

	if (filters.selectedOccupationTypeTagIds.length > 0) {
		const selected = new Set(filters.selectedOccupationTypeTagIds);
		filtered = filtered.filter((occupation) =>
			selected.has(getOccupationTagId(occupation)),
		);
	}

	return filtered;
}
