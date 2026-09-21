import { useCallback, useEffect, useMemo, useState, type UIEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useMatchResultsStore } from "../../../store/useMatchResultsStore";
import { useAppStore } from "../../../store/useAppStore";
import { content } from "../../../content";
import {
	OccupationsFilterBottomSheet,
	type OccupationsFilterState,
} from "../../filter-bottom-sheet/OccupationsFilterBottomSheet";
import { useFilterSheet } from "../../filter-bottom-sheet/useFilterSheet";
import { ResultsFilterBar } from "../ResultsFilterBar";
import {
	buildOccupationFilterChips,
	getOccupationFilterLabel,
} from "../utils/occupationFilterChips";
import { applyVacancyOccupationFilters } from "../utils/applyVacancyOccupationFilters";
import { VacanciesEmptyState } from "./VacanciesEmptyState";
import {
	buildVacancyCards,
	getVacancyEmptyState,
} from "../utils/buildVacancyCards";
import {
	LocationFilterBottomSheet,
	DEFAULT_LOCATION_FILTER,
	type LocationFilterState,
} from "../../filter-bottom-sheet/LocationFilterBottomSheet";
import { hasCustomLocationFilter } from "../../filter-bottom-sheet/plzLocality";
import { VacancyCard } from "./VacancyCard";
import { BottomNav } from "../../bottom-nav/BottomNav";
import { useFetchVacancies } from "../useFetchVacancies";
import { useSharedMatchResults } from "../useSharedMatchResults";
import { buildShareUrl } from "../utils/buildShareUrl";
import { shareResultsLink } from "../utils/shareResults";
import { ROUTE_PATHS } from "../../../routing/routes";
import { shouldShowBottomNav } from "../../../routing/sessionGuard";
import {
	ResultsPageHeader,
	TOP_ROW_HEIGHT_PX,
	useResultsPageScrollProgress,
} from "../ResultsPageHeader";
import { useCollapsedTitleReveal } from "../../collapsing-header/useCollapsedTitleReveal";
import { ContactCardBottomSheet } from "../../contact-card/ContactCardBottomSheet";

const DEFAULT_OCCUPATION_FILTERS: OccupationsFilterState = {
	selectedOccupationIds: [],
};

function getVacancyOccupationFilterIdsFromStore(): number[] {
	const { vacancyOccupationFilterIds, matchResults } =
		useMatchResultsStore.getState();
	const validOccupationIds = new Set([
		...(matchResults?.occupations.map((occupation) => occupation.id) ?? []),
		...(matchResults?.wildcardOccupations.map((occupation) => occupation.id) ??
			[]),
	]);
	return vacancyOccupationFilterIds.filter((id) => validOccupationIds.has(id));
}

export function VacanciesPage() {
	const [searchParams] = useSearchParams();
	const {
		isLoadingShared,
		sharedLoadError,
		hasSharedParam,
		sharedVacancyParams,
	} = useSharedMatchResults();
	useFetchVacancies({
		pauseWhileLoadingShared: hasSharedParam && isLoadingShared,
		sharedVacancyParams,
	});
	const matchResults = useMatchResultsStore((state) => state.matchResults);
	const favoriteVacancyKeys = useMatchResultsStore(
		(state) => state.favoriteVacancyKeys,
	);
	const toggleVacancyFavorite = useMatchResultsStore(
		(state) => state.toggleVacancyFavorite,
	);
	const vacanciesCount = useMatchResultsStore((state) => state.vacanciesCount);
	const vacancies = useAppStore((state) => state.vacancies);
	const fetchError = useAppStore((state) => state.vacanciesFetchError);
	const location = useAppStore((state) => state.location);
	const setLocation = useAppStore((state) => state.setLocation);
	const inSchool = useAppStore((state) => state.profile.inSchool);
	const showBottomNav = shouldShowBottomNav(inSchool, searchParams);

	const occupations = matchResults?.occupations ?? [];
	const wildcardOccupations = useMemo(
		() => matchResults?.wildcardOccupations ?? [],
		[matchResults?.wildcardOccupations],
	);
	const allOccupations = useMemo(
		() => [...occupations, ...wildcardOccupations],
		[occupations, wildcardOccupations],
	);
	const setVacancyOccupationFilterIds = useMatchResultsStore(
		(state) => state.setVacancyOccupationFilterIds,
	);
	const [initialOccupationFilters] = useState<OccupationsFilterState>(() => ({
		selectedOccupationIds: getVacancyOccupationFilterIdsFromStore(),
	}));
	const occupationFilter = useFilterSheet(
		DEFAULT_OCCUPATION_FILTERS,
		initialOccupationFilters,
	);
	const locationFilter = useFilterSheet(DEFAULT_LOCATION_FILTER, {
		postcode: location.postcode,
		distance: location.distance,
		locality: location.locality ?? null,
	});
	const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
	const [contactSheetOpen, setContactSheetOpen] = useState(false);
	const loading =
		isLoadingShared ||
		(occupations.length > 0 && vacancies === null && fetchError === null);

	const favoriteVacancyKeySet = useMemo(
		() => new Set(favoriteVacancyKeys),
		[favoriteVacancyKeys],
	);

	const visibleOccupations = useMemo(
		() =>
			applyVacancyOccupationFilters(occupations, {
				filters: occupationFilter.appliedValue,
			}),
		[occupations, occupationFilter.appliedValue],
	);

	const occupationFilterChips = useMemo(
		() => buildOccupationFilterChips(allOccupations),
		[allOccupations],
	);

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

	const openOccupationFilter = occupationFilter.open;
	const closeOccupationFilter = occupationFilter.close;
	const openLocationFilter = locationFilter.open;
	const closeLocationFilter = locationFilter.close;

	const toggleFavoritesOnly = useCallback(() => {
		setShowFavoritesOnly((prev) => !prev);
	}, []);

	const applyLocationFilter = useCallback(
		(filters: LocationFilterState) => {
			locationFilter.apply(filters);
			setLocation({
				postcode: filters.postcode,
				distance: filters.distance,
				locality: filters.locality ?? null,
			});
		},
		[locationFilter.apply, setLocation],
	);

	const resetLocationFilter = useCallback(() => {
		locationFilter.reset();
		setLocation({
			postcode: DEFAULT_LOCATION_FILTER.postcode,
			distance: DEFAULT_LOCATION_FILTER.distance,
			locality: null,
		});
	}, [locationFilter.reset, setLocation]);

	const applyOccupationFilter = useCallback(
		(filters: OccupationsFilterState) => {
			occupationFilter.apply(filters);
			setVacancyOccupationFilterIds(filters.selectedOccupationIds, "user");
		},
		[occupationFilter.apply, setVacancyOccupationFilterIds],
	);

	const resetOccupationFilter = useCallback(() => {
		occupationFilter.reset();
		setVacancyOccupationFilterIds([]);
	}, [occupationFilter.reset, setVacancyOccupationFilterIds]);

	useEffect(() => {
		locationFilter.apply({
			postcode: location.postcode,
			distance: location.distance,
			locality: location.locality ?? null,
		});
	}, [
		location.postcode,
		location.distance,
		location.locality,
		locationFilter.apply,
	]);

	const vacanciesByName = useMemo(
		() =>
			new Map(
				vacancies?.results.map((result) => [result.occupation, result]) ?? [],
			),
		[vacancies],
	);

	const vacancyCards = useMemo(
		() =>
			buildVacancyCards({
				occupations: visibleOccupations,
				vacanciesByName,
				showFavoritesOnly,
				favoriteVacancyKeySet,
			}),
		[
			visibleOccupations,
			vacanciesByName,
			showFavoritesOnly,
			favoriteVacancyKeySet,
		],
	);

	const visibleWildcardOccupations = useMemo(() => {
		const selectedIds = occupationFilter.appliedValue.selectedOccupationIds;
		const hasWildcardSelection = selectedIds.some((id) =>
			wildcardOccupations.some((occupation) => occupation.id === id),
		);
		return hasWildcardSelection
			? applyVacancyOccupationFilters(wildcardOccupations, {
					filters: occupationFilter.appliedValue,
				})
			: [];
	}, [wildcardOccupations, occupationFilter.appliedValue]);
	const wildcardVacancyCards = useMemo(
		() =>
			buildVacancyCards({
				occupations: visibleWildcardOccupations,
				vacanciesByName,
				showFavoritesOnly,
				favoriteVacancyKeySet,
				listKeyPrefix: "wildcard-",
			}),
		[
			visibleWildcardOccupations,
			vacanciesByName,
			showFavoritesOnly,
			favoriteVacancyKeySet,
		],
	);

	const handleShare = useCallback(async () => {
		const url = buildShareUrl(
			ROUTE_PATHS.resultsVacancies,
			visibleOccupations,
			location,
		);
		try {
			await shareResultsLink({
				title: content["vacancies.share.title"],
				text: content["vacancies.share.text"],
				url,
			});
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") {
				return;
			}
		}
	}, [visibleOccupations, location]);

	const locationFilterApplied = hasCustomLocationFilter(
		locationFilter.appliedValue,
	);
	const hasLoadedVacancies = vacancies !== null && fetchError === null;
	const noVacancyResults =
		fetchError !== null ||
		(hasLoadedVacancies &&
			vacancyCards.length === 0 &&
			wildcardVacancyCards.length === 0);
	const { showSimpleEmpty, showDetailedEmpty } = getVacancyEmptyState({
		visibleOccupationCount:
			visibleOccupations.length + visibleWildcardOccupations.length,
		locationFilterApplied,
		showFavoritesOnly,
		loading,
		noVacancyResults,
	});

	const vacancyTitle = (
		<>
			<span className="text-sky-400">{vacanciesCount}</span>{" "}
			{content["vacancies.title"]}
		</>
	);

	return (
		<>
			<div
				className={`relative flex flex-col h-full bg-white ${
					showBottomNav ? "pb-16" : ""
				}`}
			>
				<OccupationsFilterBottomSheet
					key={`occupation-${occupationFilter.sheetKey}`}
					open={occupationFilter.isOpen}
					onClose={closeOccupationFilter}
					initialFilters={occupationFilter.appliedValue}
					occupationChips={occupationFilterChips}
					onApply={applyOccupationFilter}
					onReset={resetOccupationFilter}
				/>
				<LocationFilterBottomSheet
					key={`location-${locationFilter.sheetKey}`}
					open={locationFilter.isOpen}
					onClose={closeLocationFilter}
					initialFilters={locationFilter.appliedValue}
					onApply={applyLocationFilter}
					onReset={resetLocationFilter}
				/>

				<div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
					<ResultsPageHeader
						scrollProgress={scrollProgress}
						titleRevealProgress={titleRevealProgress}
						title={vacancyTitle}
						shareAriaLabel={content["vacancies.share.ariaLabel"]}
						onShare={handleShare}
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
						{vacancyTitle}
					</h1>
					<ResultsFilterBar
						hasLocationFilter={true}
						appliedLocationFilter={locationFilter.appliedValue}
						selectedOccupationIds={
							occupationFilter.appliedValue.selectedOccupationIds
						}
						resolveOccupationFilterLabel={(id) =>
							getOccupationFilterLabel(id, allOccupations)
						}
						occupationFilterTitle={
							content["vacancies.filter.occupations.title.short"]
						}
						occupationFilterAriaLabel={
							content["vacancies.filter.occupations.filterButton.ariaLabel"]
						}
						onOpenTagFilter={openOccupationFilter}
						onOpenLocationFilter={openLocationFilter}
						showFavoritesOnly={showFavoritesOnly}
						onToggleFavoritesOnly={toggleFavoritesOnly}
						scrollProgress={scrollProgress}
					/>
					{showSimpleEmpty || showDetailedEmpty || sharedLoadError ? (
						<VacanciesEmptyState detailed={showDetailedEmpty} />
					) : (
						<div className="px-4 pb-4 space-y-3">
							{vacancyCards.map(({ listKey, key, occupation, preview }) => (
								<VacancyCard
									key={listKey}
									occupationName={occupation.name}
									preview={preview}
									isFavorite={favoriteVacancyKeySet.has(key)}
									onToggleFavorite={() => toggleVacancyFavorite(key)}
								/>
							))}
							{wildcardVacancyCards.map(
								({ listKey, key, occupation, preview }) => (
									<VacancyCard
										key={listKey}
										occupationName={occupation.name}
										preview={preview}
										isFavorite={favoriteVacancyKeySet.has(key)}
										onToggleFavorite={() => toggleVacancyFavorite(key)}
									/>
								),
							)}
							<div className="flex flex-col gap-5 px-3 py-5 rounded-2xl bg-sky-50">
								<div>
									<h3 className="text-2xl font-semibold text-sky-900 text-center mb-[7px]">
										{content["vacancies.bottomCard.title"]}
									</h3>
									<p className="text-lg text-sky-900 text-center">
										{content["vacancies.bottomCard.description"]}
									</p>
								</div>
								<div className="flex flex-col">
									<button
										type="button"
										onClick={() => setContactSheetOpen(true)}
										aria-label={
											content["vacancies.bottomCard.consultationCta.ariaLabel"]
										}
										className="h-12 flex items-center justify-center gap-2 w-full py-2 px-5 rounded-2xl text-base font-medium transition-colors bg-sky-300 text-sky-900
									focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 active:bg-sky-200 active:text-sky-900 md:hover:bg-sky-200 md:hover:text-sky-900"
									>
										{content["vacancies.bottomCard.consultationCta"]}
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
			<ContactCardBottomSheet
				open={contactSheetOpen}
				onClose={() => setContactSheetOpen(false)}
			/>
			{showBottomNav && <BottomNav />}
		</>
	);
}
