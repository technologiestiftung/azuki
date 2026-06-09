import { useCallback, useMemo, useState } from "react";
import { useMatchResultsStore } from "../../store/useMatchResultsStore";
import { content } from "../../content";
import { type MatchedOccupation } from "@azuki/shared";
import {
	OccupationTagsFilterBottomSheet,
	type OccupationTagsFilterState,
} from "../filter-bottom-sheet/OccupationTagsFilterBottomSheet";
import { useFilterSheet } from "../filter-bottom-sheet/useFilterSheet";
import { ResultCard } from "./ResultCard";
import { ResultsPageHeader } from "./ResultsPageHeader";
import { BottomCard } from "./BottomCard";
import { ResultsFilterBar } from "./ResultsFilterBar";
import { buildResultTagChips } from "./utils/resultTagChips";
import { applyOccupationFilters } from "./utils/applyOccupationFilters";

const DEFAULT_TAG_FILTERS: OccupationTagsFilterState = {
	selectedOccupationTypeTagIds: [],
};

export function ResultsPage() {
	const matchResults = useMatchResultsStore((state) => state.matchResults);
	const favoriteOccupationIds = useMatchResultsStore(
		(state) => state.favoriteOccupationIds,
	);
	const occupations = matchResults?.occupations ?? [];
	const tagFilter = useFilterSheet(DEFAULT_TAG_FILTERS);
	const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

	const favoriteIds = useMemo(
		() => new Set(favoriteOccupationIds),
		[favoriteOccupationIds],
	);

	const visibleOccupations = useMemo(
		() =>
			applyOccupationFilters(occupations, {
				filters: tagFilter.appliedValue,
				showFavoritesOnly,
				favoriteIds,
			}),
		[occupations, tagFilter.appliedValue, showFavoritesOnly, favoriteIds],
	);

	const occupationTypeTagChips = useMemo(
		() => buildResultTagChips(occupations),
		[occupations],
	);

	const openTagFilter = tagFilter.open;
	const closeTagFilter = tagFilter.close;

	const toggleFavoritesOnly = useCallback(() => {
		setShowFavoritesOnly((prev) => !prev);
	}, []);

	return (
		<div className="flex flex-col h-full">
			<ResultsPageHeader title={content["results.title"]} />
			<ResultsFilterBar
				hasLocationFilter={false}
				selectedOccupationTypeTagIds={
					tagFilter.appliedValue.selectedOccupationTypeTagIds
				}
				onOpenTagFilter={openTagFilter}
				showFavoritesOnly={showFavoritesOnly}
				onToggleFavoritesOnly={toggleFavoritesOnly}
			/>
			<OccupationTagsFilterBottomSheet
				key={tagFilter.sheetKey}
				open={tagFilter.isOpen}
				onClose={closeTagFilter}
				initialFilters={tagFilter.appliedValue}
				occupationTypeTagChips={occupationTypeTagChips}
				onApply={tagFilter.apply}
				onReset={tagFilter.reset}
			/>

			<div className="flex-1 px-4 pb-4 space-y-3 overflow-y-auto">
				{visibleOccupations.length > 0 ? (
					<>
						{visibleOccupations.map((occupation: MatchedOccupation) => (
							<ResultCard key={occupation.id} occupation={occupation} />
						))}
						<BottomCard />
					</>
				) : (
					<div className="flex px-4 pb-4 items-center h-full">
						<div className="flex flex-col items-center justify-center gap-5 px-5">
							<div className="flex items-center justify-center object-contain p-2">
								<img
									src="/illustrations/no-results-star.svg"
									alt=""
									className="w-[200px]"
								/>
							</div>

							<p className="text-lg font-medium text-gray-1000 text-center">
								{content["results.noResults"]}
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
