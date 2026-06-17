import {
	formatOccupationDisplayName,
	type MatchedOccupation,
} from "@azuki/shared";
import type { FilterOccupationChip } from "../../filter-bottom-sheet/OccupationsFilterBottomSheet";

export function buildOccupationFilterChips(
	occupations: MatchedOccupation[],
): FilterOccupationChip[] {
	return occupations.map((occupation) => ({
		id: occupation.id,
		label: formatOccupationDisplayName(occupation.name),
	}));
}

export function getOccupationFilterLabel(
	occupationId: number,
	occupations: MatchedOccupation[],
): string {
	const occupation = occupations.find((entry) => entry.id === occupationId);
	if (!occupation) {
		return String(occupationId);
	}
	return formatOccupationDisplayName(occupation.name);
}
