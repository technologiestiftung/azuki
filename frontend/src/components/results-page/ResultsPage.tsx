import { useCallback, useMemo, useState, type UIEvent } from "react";
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
import { ResultsPageHeaderCollapsed } from "./ResultsPageHeaderCollapsed";

const DEFAULT_TAG_FILTERS: OccupationTagsFilterState = {
	selectedOccupationTypeTagIds: [],
};

const COLLAPSED_HEADER_SCROLL_THRESHOLD = 64;

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

	const [scrollProgress, setScrollProgress] = useState(0);

	const toggleFavoritesOnly = useCallback(() => {
		setShowFavoritesOnly((prev) => !prev);
	}, []);

	const handleListScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
		const { scrollTop } = event.currentTarget;
		setScrollProgress(
			Math.min(1, scrollTop / COLLAPSED_HEADER_SCROLL_THRESHOLD),
		);
	}, []);

	return (
		<div className="flex flex-col h-full pb-16">
			<div className="relative shrink-0">
				<div
					className="absolute top-0 inset-x-0 z-10 bg-white transition-opacity duration-150"
					style={{
						opacity: scrollProgress,
						pointerEvents: scrollProgress < 0.5 ? "none" : "auto",
					}}
					aria-hidden={scrollProgress < 0.5}
				>
					<ResultsPageHeaderCollapsed title={content["results.title"]} />
				</div>
				<h1
					className="text-3xl font-semibold text-sky-900 text-left py-2 px-[18px] transition-opacity duration-150"
					style={{
						opacity: 1 - scrollProgress,
						pointerEvents: scrollProgress >= 0.5 ? "none" : "auto",
					}}
					aria-hidden={scrollProgress >= 0.5}
				>
					{content["results.title"]}
				</h1>
			</div>
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

			<div
				className="flex-1 px-4 pb-4 space-y-3 overflow-y-auto"
				onScroll={handleListScroll}
			>
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
			<BottomNav />
		</div>
	);
}
