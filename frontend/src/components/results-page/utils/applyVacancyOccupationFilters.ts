import type { MatchedOccupation } from "@azuki/shared";
import type { OccupationsFilterState } from "../../filter-bottom-sheet/OccupationsFilterBottomSheet";

export function applyVacancyOccupationFilters(
	occupations: MatchedOccupation[],
	{
		filters,
	}: {
		filters: OccupationsFilterState;
	},
): MatchedOccupation[] {
	let filtered = occupations;

	if (filters.selectedOccupationIds.length > 0) {
		const selected = new Set(filters.selectedOccupationIds);
		filtered = filtered.filter((occupation) => selected.has(occupation.id));
	}

	return filtered;
}
