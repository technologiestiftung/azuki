import { useCallback, useEffect, useMemo, useState } from "react";
import type { MatchedOccupation } from "@azuki/shared";
import { useMatchResultsStore } from "../../../store/useMatchResultsStore";
import { useAppStore } from "../../../store/useAppStore";
import { fetchAusbildungsplaetze } from "../../../api/client";
import { content } from "../../../content";
import {
	OccupationTagsFilterBottomSheet,
	type OccupationTagsFilterState,
} from "../../filter-bottom-sheet/OccupationTagsFilterBottomSheet";
import { useFilterSheet } from "../../filter-bottom-sheet/useFilterSheet";
import { ResultsPageHeader } from "../ResultsPageHeader";
import { ResultsFilterBar } from "../ResultsFilterBar";
import { buildResultTagChips } from "../utils/resultTagChips";
import { applyOccupationFilters } from "../utils/applyOccupationFilters";
import {
	LocationFilterBottomSheet,
	DEFAULT_LOCATION_FILTER,
	type LocationFilterState,
} from "../../filter-bottom-sheet/LocationFilterBottomSheet";
import { VacancyCard } from "./VacancyCard";

const DEFAULT_TAG_FILTERS: OccupationTagsFilterState = {
	selectedOccupationTypeTagIds: [],
};

export function VacanciesPage() {
	const matchResults = useMatchResultsStore((state) => state.matchResults);
	const favoriteOccupationIds = useMatchResultsStore(
		(state) => state.favoriteOccupationIds,
	);
	const ausbildungsplaetze = useAppStore((state) => state.ausbildungsplaetze);
	const setAusbildungsplaetze = useAppStore(
		(state) => state.setAusbildungsplaetze,
	);
	const location = useAppStore((state) => state.location);
	const setLocation = useAppStore((state) => state.setLocation);
	const occupations = matchResults?.occupations ?? [];
	const tagFilter = useFilterSheet(DEFAULT_TAG_FILTERS);
	const locationFilter = useFilterSheet(DEFAULT_LOCATION_FILTER, {
		postcode: location.postcode,
		distance: location.distance,
	});
	const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

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

	const vacanciesByName = new Map(
		ausbildungsplaetze?.results.map((r) => [r.occupation, r]) ?? [],
	);

	return (
		<>
			<div className="flex flex-col h-full">
				<ResultsPageHeader title={content["results.title"]} />
				<ResultsFilterBar
					hasLocationFilter={true}
					appliedLocationFilter={locationFilter.appliedValue}
					selectedOccupationTypeTagIds={
						tagFilter.appliedValue.selectedOccupationTypeTagIds
					}
					onOpenTagFilter={openTagFilter}
					onOpenLocationFilter={openLocationFilter}
					showFavoritesOnly={showFavoritesOnly}
					onToggleFavoritesOnly={toggleFavoritesOnly}
				/>
				<OccupationTagsFilterBottomSheet
					key={`tag-${tagFilter.sheetKey}`}
					open={tagFilter.isOpen}
					onClose={closeTagFilter}
					initialFilters={tagFilter.appliedValue}
					occupationTypeTagChips={occupationTypeTagChips}
					onApply={tagFilter.apply}
					onReset={tagFilter.reset}
				/>
				<LocationFilterBottomSheet
					key={`location-${locationFilter.sheetKey}`}
					open={locationFilter.isOpen}
					onClose={closeLocationFilter}
					initialFilters={locationFilter.appliedValue}
					onApply={applyLocationFilter}
					onReset={resetLocationFilter}
				/>

				{visibleOccupations.length === 0 && (
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
								{content["vacancies.noResultsFound"]}
							</p>
						</div>
					</div>
				)}

				{fetchError || vacanciesByName.size === 0 ? (
					<div className="flex px-4 pb-4 items-center h-full">
						<div className="flex flex-col items-center justify-center gap-5 px-5">
							<div className="flex items-center justify-center object-contain p-2">
								<img
									src="/illustrations/no-results-star.svg"
									alt=""
									className="w-[200px] "
								/>
							</div>
							<div>
								<h3 className="text-lg font-bold text-gray-1000 mb-1.5 text-center">
									{content["vacancies.noResults.p1"]}
								</h3>
								<p className="text-lg font-medium text-gray-1000 text-center">
									{content["vacancies.noResults.p2"]}
								</p>
							</div>
						</div>
					</div>
				) : (
					<div className="flex-1 px-4 pb-4 space-y-3 overflow-y-auto">
						{visibleOccupations.map((occupation: MatchedOccupation) => (
							<VacancyCard
								key={occupation.id}
								occupation={occupation}
								vacancies={vacanciesByName.get(occupation.rawName)}
								distance={location.distance}
								loading={loading}
							/>
						))}
						<div className="flex flex-col gap-5 px-3 py-5 rounded-2xl border border-sky-100 bg-sky-50">
							<div>
								<h3 className="text-2xl font-semibold text-sky-1000 text-center mb-[7px]">
									{content["vacancies.bottomCard.title"]}
								</h3>
								<p className="text-lg text-sky-1000 text-center">
									{content["vacancies.bottomCard.description"]}
								</p>
							</div>
							<div className="flex flex-col">
								<a
									href={content["vacancies.bottomCard.consultationLink"]}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={
										content["vacancies.bottomCard.consultationCta.ariaLabel"]
									}
									className="h-12 flex items-center justify-center gap-2 w-full py-2 px-5 rounded-2xl text-base font-medium transition-colors bg-sky-300 text-sky-1000
									focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 active:bg-sky-200 active:text-sky-900 md:hover:bg-sky-200 md:hover:text-sky-900"
								>
									{content["vacancies.bottomCard.consultationCta"]}
								</a>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
