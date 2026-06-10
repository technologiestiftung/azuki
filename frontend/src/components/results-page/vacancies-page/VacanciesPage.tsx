import { useCallback, useEffect, useMemo, useState } from "react";
import type { AusbildungsplatzPreview, MatchedOccupation } from "@azuki/shared";
import { useMatchResultsStore } from "../../../store/useMatchResultsStore";
import { useAppStore } from "../../../store/useAppStore";
import { fetchAusbildungsplaetze } from "../../../api/client";
import { content } from "../../../content";
import {
	OccupationsFilterBottomSheet,
	type OccupationsFilterState,
} from "../../filter-bottom-sheet/OccupationsFilterBottomSheet";
import { useFilterSheet } from "../../filter-bottom-sheet/useFilterSheet";
import { ResultsPageHeader } from "../ResultsPageHeader";
import { ResultsFilterBar } from "../ResultsFilterBar";
import {
	buildOccupationFilterChips,
	getOccupationFilterLabel,
} from "../utils/occupationFilterChips";
import { applyVacancyOccupationFilters } from "../utils/applyVacancyOccupationFilters";
import { buildVacancyCardKey } from "../utils/vacancyCardKey";
import {
	LocationFilterBottomSheet,
	DEFAULT_LOCATION_FILTER,
	type LocationFilterState,
} from "../../filter-bottom-sheet/LocationFilterBottomSheet";
import { hasCustomLocationFilter } from "../../filter-bottom-sheet/plzLocality";
import { VacancyCard } from "./VacancyCard";

const DEFAULT_OCCUPATION_FILTERS: OccupationsFilterState = {
	selectedOccupationIds: [],
};

interface VacancyListItem {
	key: string;
	occupation: MatchedOccupation;
	preview: AusbildungsplatzPreview;
}

function getVacancyEmptyState({
	visibleOccupationCount,
	locationFilterApplied,
	showFavoritesOnly,
	loading,
	noVacancyResults,
}: {
	visibleOccupationCount: number;
	locationFilterApplied: boolean;
	showFavoritesOnly: boolean;
	loading: boolean;
	noVacancyResults: boolean;
}) {
	const showSimpleEmpty =
		visibleOccupationCount === 0 ||
		(locationFilterApplied && !loading && noVacancyResults) ||
		(showFavoritesOnly && !loading && noVacancyResults);
	const showDetailedEmpty =
		!locationFilterApplied &&
		!showFavoritesOnly &&
		!loading &&
		noVacancyResults &&
		visibleOccupationCount > 0;
	return { showSimpleEmpty, showDetailedEmpty };
}

export function VacanciesPage() {
	const matchResults = useMatchResultsStore((state) => state.matchResults);
	const favoriteVacancyKeys = useMatchResultsStore(
		(state) => state.favoriteVacancyKeys,
	);
	const toggleVacancyFavorite = useMatchResultsStore(
		(state) => state.toggleVacancyFavorite,
	);
	const ausbildungsplaetze = useAppStore((state) => state.ausbildungsplaetze);
	const setAusbildungsplaetze = useAppStore(
		(state) => state.setAusbildungsplaetze,
	);
	const location = useAppStore((state) => state.location);
	const setLocation = useAppStore((state) => state.setLocation);
	const occupations = matchResults?.occupations ?? [];
	const occupationFilter = useFilterSheet(DEFAULT_OCCUPATION_FILTERS);
	const locationFilter = useFilterSheet(DEFAULT_LOCATION_FILTER, {
		postcode: location.postcode,
		distance: location.distance,
	});
	const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

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
		() => buildOccupationFilterChips(occupations),
		[occupations],
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
			setLocation({ postcode: filters.postcode, distance: filters.distance });
		},
		[locationFilter.apply, setLocation],
	);

	const resetLocationFilter = useCallback(() => {
		locationFilter.reset();
		setLocation({
			postcode: DEFAULT_LOCATION_FILTER.postcode,
			distance: DEFAULT_LOCATION_FILTER.distance,
		});
	}, [locationFilter.reset, setLocation]);

	useEffect(() => {
		if (occupations.length === 0 || ausbildungsplaetze !== null) {
			return () => {};
		}
		const controller = new AbortController();
		const occupationNames = occupations.map((o) => o.rawName);
		setFetchError(null);
		setLoading(true);
		(async () => {
			try {
				const response = await fetchAusbildungsplaetze(
					location.postcode,
					occupationNames,
					{
						distance: location.distance,
						signal: controller.signal,
					},
				);
				if (!controller.signal.aborted) {
					setAusbildungsplaetze(response);
				}
			} catch (err) {
				if (controller.signal.aborted) {
					return;
				}
				if (err instanceof DOMException && err.name === "AbortError") {
					return;
				}
				setFetchError(content["results.fetchError"]);
			} finally {
				if (!controller.signal.aborted) {
					setLoading(false);
				}
			}
		})();
		return () => {
			controller.abort();
		};
	}, [
		ausbildungsplaetze,
		occupations,
		setAusbildungsplaetze,
		location.postcode,
		location.distance,
	]);

	const vacanciesByName = useMemo(
		() =>
			new Map(
				ausbildungsplaetze?.results.map((result) => [result.occupation, result]) ??
					[],
			),
		[ausbildungsplaetze],
	);

	const vacancyCards = useMemo((): VacancyListItem[] => {
		const cards: VacancyListItem[] = [];
		for (const occupation of visibleOccupations) {
			const vacancies = vacanciesByName.get(occupation.rawName);
			if (!vacancies?.previews.length) {
				continue;
			}
			for (const [index, preview] of vacancies.previews.entries()) {
				const key = buildVacancyCardKey(occupation.id, preview, index);
				if (showFavoritesOnly && !favoriteVacancyKeySet.has(key)) {
					continue;
				}
				cards.push({
					key,
					occupation,
					preview,
				});
			}
		}
		return cards;
	}, [visibleOccupations, vacanciesByName, showFavoritesOnly, favoriteVacancyKeySet]);

	const locationFilterApplied = hasCustomLocationFilter(
		locationFilter.appliedValue,
	);
	const hasLoadedVacancies = ausbildungsplaetze !== null && fetchError === null;
	const noVacancyResults =
		fetchError !== null || (hasLoadedVacancies && vacancyCards.length === 0);
	const { showSimpleEmpty, showDetailedEmpty } = getVacancyEmptyState({
		visibleOccupationCount: visibleOccupations.length,
		locationFilterApplied,
		showFavoritesOnly,
		loading,
		noVacancyResults,
	});

	return (
		<>
			<div className="flex flex-col h-full">
				<ResultsPageHeader title={content["results.title"]} />
				<ResultsFilterBar
					hasLocationFilter={true}
					appliedLocationFilter={locationFilter.appliedValue}
					selectedOccupationIds={
						occupationFilter.appliedValue.selectedOccupationIds
					}
					resolveOccupationFilterLabel={(id) =>
						getOccupationFilterLabel(id, occupations)
					}
					occupationFilterTitle={content["vacancies.filter.occupations.title"]}
					occupationFilterTitleShort={
						content["vacancies.filter.occupations.title.short"]
					}
					occupationFilterAriaLabel={
						content["vacancies.filter.occupations.filterButton.ariaLabel"]
					}
					onOpenTagFilter={openOccupationFilter}
					onOpenLocationFilter={openLocationFilter}
					showFavoritesOnly={showFavoritesOnly}
					onToggleFavoritesOnly={toggleFavoritesOnly}
				/>
				<OccupationsFilterBottomSheet
					key={`occupation-${occupationFilter.sheetKey}`}
					open={occupationFilter.isOpen}
					onClose={closeOccupationFilter}
					initialFilters={occupationFilter.appliedValue}
					occupationChips={occupationFilterChips}
					onApply={occupationFilter.apply}
					onReset={occupationFilter.reset}
				/>
				<LocationFilterBottomSheet
					key={`location-${locationFilter.sheetKey}`}
					open={locationFilter.isOpen}
					onClose={closeLocationFilter}
					initialFilters={locationFilter.appliedValue}
					onApply={applyLocationFilter}
					onReset={resetLocationFilter}
				/>

				{showSimpleEmpty || showDetailedEmpty ? (
					<div className="flex px-4 pb-4 items-center h-full">
						<div className="flex flex-col items-center justify-center gap-5 px-5">
							<div className="flex items-center justify-center object-contain p-2">
								<img
									src="/illustrations/no-results-star.svg"
									alt=""
									className="w-[200px]"
								/>
							</div>
							{showSimpleEmpty ? (
								<p className="text-lg font-medium text-gray-1000 text-center">
									{content["vacancies.noResultsFound"]}
								</p>
							) : (
								<div>
									<h3 className="text-lg font-bold text-gray-1000 mb-1.5 text-center">
										{content["vacancies.noResults.p1"]}
									</h3>
									<p className="text-lg font-medium text-gray-1000 text-center">
										{content["vacancies.noResults.p2"]}
									</p>
								</div>
							)}
						</div>
					</div>
				) : (
					<div className="flex-1 px-4 pb-4 space-y-3 overflow-y-auto">
						{loading && vacancyCards.length === 0 ? (
							<p className="py-8 text-center text-sm text-gray-500">…</p>
						) : (
							vacancyCards.map(({ key, occupation, preview }) => (
								<VacancyCard
									key={key}
									occupationName={occupation.name}
									preview={preview}
									isFavorite={favoriteVacancyKeySet.has(key)}
									onToggleFavorite={() => toggleVacancyFavorite(key)}
								/>
							))
						)}
					</div>
				)}
			</div>
		</>
	);
}
