import { useCallback, useMemo, useState, type UIEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useMatchResultsStore } from "../../store/useMatchResultsStore";
import { useAppStore } from "../../store/useAppStore";
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
import { useSharedMatchResults } from "./useSharedMatchResults";
import { buildShareUrl } from "./utils/buildShareUrl";
import { shareResultsLink } from "./utils/shareResults";
import { ROUTE_PATHS } from "../../routing/routes";
import { hasShareQueryParams } from "../../routing/sessionGuard";
import {
	ResultsPageHeader,
	TOP_ROW_HEIGHT_PX,
	useResultsPageScrollProgress,
} from "./ResultsPageHeader";
import { useCollapsedTitleReveal } from "../collapsing-header/useCollapsedTitleReveal";

const DEFAULT_TAG_FILTERS: OccupationTagsFilterState = {
	selectedOccupationTypeTagIds: [],
};

export function ResultsPage() {
	const [searchParams] = useSearchParams();
	const { isLoadingShared, hasSharedParam, sharedVacancyParams } =
		useSharedMatchResults();
	useFetchVacancies({
		pauseWhileLoadingShared: hasSharedParam && isLoadingShared,
		sharedVacancyParams,
	});
	const matchResults = useMatchResultsStore((state) => state.matchResults);
	const favoriteOccupationIds = useMatchResultsStore(
		(state) => state.favoriteOccupationIds,
	);
	const inSchool = useAppStore((state) => state.profile.inSchool);
	const showBottomNav = inSchool !== null && !hasShareQueryParams(searchParams);
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
	const { titleRef, titleRevealProgress, updateTitleReveal } =
		useCollapsedTitleReveal();
	const handleScroll = useCallback(
		(event: UIEvent<HTMLDivElement>) => {
			handleListScroll(event);
			updateTitleReveal(event.currentTarget);
		},
		[handleListScroll, updateTitleReveal],
	);

	const toggleFavoritesOnly = useCallback(() => {
		setShowFavoritesOnly((prev) => !prev);
	}, []);

	const handleDownload = useCallback(async () => {
		try {
			const { exportOccupationsPdf } = await import(
				"./utils/exportOccupationsPdf"
			);
			await exportOccupationsPdf(visibleOccupations);
		} catch (err) {
			console.error("Failed to export occupations PDF:", err);
		}
	}, [visibleOccupations]);

	const handleShare = useCallback(async () => {
		const url = buildShareUrl(ROUTE_PATHS.resultsList, visibleOccupations);
		try {
			await shareResultsLink({
				title: content["results.share.title"],
				text: content["results.share.text"],
				url,
			});
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") {
				return;
			}
		}
	}, [visibleOccupations]);

	return (
		<div
			className={`relative flex flex-col h-full bg-white ${
				showBottomNav ? "pb-16" : ""
			}`}
		>
			<OccupationTagsFilterBottomSheet
				key={tagFilter.sheetKey}
				open={tagFilter.isOpen}
				onClose={closeTagFilter}
				initialFilters={tagFilter.appliedValue}
				occupationTypeTagChips={occupationTypeTagChips}
				onApply={tagFilter.apply}
				onReset={tagFilter.reset}
			/>
			<div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
				<ResultsPageHeader
					scrollProgress={scrollProgress}
					titleRevealProgress={titleRevealProgress}
					title={content["results.title"]}
					shareAriaLabel={content["results.share.ariaLabel"]}
					downloadAriaLabel={content["results.download.ariaLabel"]}
					onDownload={handleDownload}
					onShare={handleShare}
					downloadDisabled={visibleOccupations.length === 0}
					shareDisabled={visibleOccupations.length === 0}
				/>
				<h1
					ref={titleRef}
					className="text-3xl font-semibold text-left bg-white text-sky-900 py-2 px-[18px]"
					style={{
						marginTop: TOP_ROW_HEIGHT_PX,
						opacity: 1 - scrollProgress,
					}}
					aria-hidden={scrollProgress >= 0.5}
				>
					{content["results.title"]}
				</h1>
				<ResultsFilterBar
					hasLocationFilter={false}
					selectedOccupationTypeTagIds={
						tagFilter.appliedValue.selectedOccupationTypeTagIds
					}
					onOpenTagFilter={openTagFilter}
					showFavoritesOnly={showFavoritesOnly}
					onToggleFavoritesOnly={toggleFavoritesOnly}
					scrollProgress={scrollProgress}
				/>
				<div className="px-4 pb-4 space-y-3">
					{!isLoadingShared && visibleOccupations.length > 0 && (
						<>
							{visibleOccupations.map((occupation: MatchedOccupation) => (
								<ResultCard key={occupation.id} occupation={occupation} />
							))}
							<BottomCard />
						</>
					)}
					{!isLoadingShared && visibleOccupations.length === 0 && (
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
			{showBottomNav && <BottomNav />}
		</div>
	);
}
