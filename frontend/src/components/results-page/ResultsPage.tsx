import { useCallback, useMemo, useState } from "react";
import { useMatchResultsStore } from "../../store/useMatchResultsStore";
import { content } from "../../content";
import { type MatchedOccupation } from "@azuki/shared";
import {
	FilterBottomSheet,
	getAppliedFilterCount,
	type FilterBottomSheetState,
} from "../filter-bottom-sheet/FilterBottomSheet";
import { ResultCard } from "./ResultCard";
import { ResultsPageHeader } from "./ResultsPageHeader";
import { BottomCard } from "./BottomCard";

const DEFAULT_FILTERS: FilterBottomSheetState = {
	showFavoritesOnly: false,
	selectedOccupationTypeIds: [],
};

function applyFilters(
	occupations: MatchedOccupation[],
	filters: FilterBottomSheetState,
	favoriteIds: Set<number>,
): MatchedOccupation[] {
	let filtered = occupations;

	if (filters.showFavoritesOnly) {
		filtered = filtered.filter((occupation) => favoriteIds.has(occupation.id));
	}

	if (filters.selectedOccupationTypeIds.length > 0) {
		const selected = new Set(filters.selectedOccupationTypeIds);
		filtered = filtered.filter(
			(occupation) =>
				occupation.occupationType && selected.has(occupation.occupationType),
		);
	}

	return filtered;
}

export function ResultsPage() {
	const matchResults = useMatchResultsStore((state) => state.matchResults);
	const favoriteOccupationIds = useMatchResultsStore(
		(state) => state.favoriteOccupationIds,
	);
	const occupations = matchResults?.occupations ?? [];
	const [filterOpen, setFilterOpen] = useState(false);
	const [appliedFilters, setAppliedFilters] =
		useState<FilterBottomSheetState>(DEFAULT_FILTERS);

	const favoriteIds = useMemo(
		() => new Set(favoriteOccupationIds),
		[favoriteOccupationIds],
	);

	const visibleOccupations = useMemo(
		() => applyFilters(occupations, appliedFilters, favoriteIds),
		[occupations, appliedFilters, favoriteIds],
	);

	const activeFilterCount = useMemo(
		() => getAppliedFilterCount(appliedFilters),
		[appliedFilters],
	);

	const openFilter = useCallback(() => setFilterOpen(true), []);
	const closeFilter = useCallback(() => setFilterOpen(false), []);

	const handleApplyFilters = useCallback((filters: FilterBottomSheetState) => {
		setAppliedFilters(filters);
	}, []);

	const handleResetFilters = useCallback(() => {
		setAppliedFilters(DEFAULT_FILTERS);
	}, []);

	return (
		<div className="flex flex-col h-full">
			<ResultsPageHeader
				title={content["results.title"]}
				hasFilterButton
				activeFilterCount={activeFilterCount}
				onFilterClick={openFilter}
			/>
			<FilterBottomSheet
				open={filterOpen}
				onClose={closeFilter}
				initialFilters={appliedFilters}
				onApply={handleApplyFilters}
				onReset={handleResetFilters}
			/>

			<div className="flex-1 px-4 pb-4 pt-10 space-y-3 overflow-y-auto">
				{visibleOccupations.length > 0 &&
					visibleOccupations.map((occupation: MatchedOccupation) => (
						<ResultCard key={occupation.id} occupation={occupation} />
					))}
				{visibleOccupations.length > 0 && <BottomCard />}
			</div>
		</div>
	);
}
