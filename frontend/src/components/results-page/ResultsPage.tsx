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
import { BottomCard } from "./BottomCard";
import { ResultsFilterBar } from "./ResultsFilterBar";
import { buildResultTagChips } from "./utils/resultTagChips";
import { applyOccupationFilters } from "./utils/applyOccupationFilters";
import { BottomNav } from "../bottom-nav/BottomNav";
import { useFetchVacancies } from "./useFetchVacancies";
import {
	ResultsPageHeader,
	RESULTS_PAGE_HEADER_EXPANDED_HEIGHT,
	useResultsPageScrollProgress,
} from "./ResultsPageHeader";

const DEFAULT_TAG_FILTERS: OccupationTagsFilterState = {
	selectedOccupationTypeTagIds: [],
};

export function ResultsPage() {
	useFetchVacancies();
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

	const { scrollProgress, handleListScroll } = useResultsPageScrollProgress();

	const toggleFavoritesOnly = useCallback(() => {
		setShowFavoritesOnly((prev) => !prev);
	}, []);

	return (
		<div className="relative flex h-full flex-col pb-16">
			<OccupationTagsFilterBottomSheet
				key={tagFilter.sheetKey}
				open={tagFilter.isOpen}
				onClose={closeTagFilter}
				initialFilters={tagFilter.appliedValue}
				occupationTypeTagChips={occupationTypeTagChips}
				onApply={tagFilter.apply}
				onReset={tagFilter.reset}
			/>

			<ResultsPageHeader
				scrollProgress={scrollProgress}
				title={content["results.title"]}
				shareAriaLabel={content["results.share.ariaLabel"]}
				downloadAriaLabel={content["results.download.ariaLabel"]}
			>
				<ResultsFilterBar
					scrollProgress={scrollProgress}
					hasLocationFilter={false}
					selectedOccupationTypeTagIds={
						tagFilter.appliedValue.selectedOccupationTypeTagIds
					}
					onOpenTagFilter={openTagFilter}
					showFavoritesOnly={showFavoritesOnly}
					onToggleFavoritesOnly={toggleFavoritesOnly}
				/>
			</ResultsPageHeader>

			<div
				className="flex-1 min-h-0 overflow-y-auto"
				onScroll={handleListScroll}
				style={{ paddingTop: RESULTS_PAGE_HEADER_EXPANDED_HEIGHT }}
			>
				<div className="px-4 pb-4 space-y-3">
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
			<BottomNav />
		</div>
	);
}
