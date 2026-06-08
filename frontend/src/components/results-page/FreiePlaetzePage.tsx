import { useCallback, useEffect, useMemo, useState } from "react";
import type { AusbildungsplatzResult, MatchedOccupation } from "@azuki/shared";
import { useMatchResultsStore } from "../../store/useMatchResultsStore";
import { useAppStore } from "../../store/useAppStore";
import { fetchAusbildungsplaetze } from "../../api/client";
import { content } from "../../content";
import {
	OccupationTagsFilterBottomSheet,
	type OccupationTagsFilterState,
} from "../filter-bottom-sheet/OccupationTagsFilterBottomSheet";
import { useFilterSheet } from "../filter-bottom-sheet/useFilterSheet";
import { ResultsPageHeader } from "./ResultsPageHeader";
import { ResultsFilterBar } from "./ResultsFilterBar";
import { buildResultTagChips } from "./resultTagChips";
import { applyOccupationFilters } from "./applyOccupationFilters";
import {
	LocationFilterBottomSheet,
	DEFAULT_LOCATION_FILTER,
	type LocationFilterState,
} from "../filter-bottom-sheet/LocationFilterBottomSheet";

const DEFAULT_TAG_FILTERS: OccupationTagsFilterState = {
	selectedOccupationTypeTagIds: [],
};

function formatStartDate(iso: string | undefined): string | null {
	if (!iso) {
		return null;
	}
	const parsed = new Date(iso);
	if (Number.isNaN(parsed.getTime())) {
		return null;
	}
	const dd = String(parsed.getDate()).padStart(2, "0");
	const mm = String(parsed.getMonth() + 1).padStart(2, "0");
	const yyyy = parsed.getFullYear();
	return `${dd}.${mm}.${yyyy}`;
}

interface BerufCardProps {
	occupation: MatchedOccupation;
	vacancies: AusbildungsplatzResult | undefined;
	distance: number;
	loading: boolean;
}

function renderStellenContent(
	vacancies: AusbildungsplatzResult | undefined,
	distance: number,
	loading: boolean,
) {
	if (loading && vacancies === undefined) {
		return <span className="text-sm text-gray-400">…</span>;
	}
	if (vacancies === undefined || vacancies.totalCount === 0) {
		return (
			<span className="text-sm text-gray-500">
				{content["results.badge.empty"]}
			</span>
		);
	}
	return (
		<>
			<div className="text-sm font-semibold text-sky-700 mb-3">
				{vacancies.totalCount} {content["results.badge.suffix"]} · {distance} km
			</div>

			{vacancies.previews.length > 0 && (
				<>
					<p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
						{content["results.previewHeading"]}
					</p>
					<ul className="space-y-2 mb-3">
						{vacancies.previews.map((preview, i) => {
							const startDate = formatStartDate(preview.eintrittsdatum);
							return (
								<li
									key={`${preview.employer}-${preview.city}-${i}`}
									className="text-sm"
								>
									<div className="text-gray-900 font-medium">
										{preview.employer}
									</div>
									<div className="text-gray-500">
										{preview.city}
										{startDate &&
											` · ${content["results.startDatePrefix"]} ${startDate}`}
									</div>
								</li>
							);
						})}
					</ul>
				</>
			)}

			<a
				href={vacancies.searchUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="text-sm font-medium text-sky-700 hover:text-sky-800"
			>
				{content["results.showAllLink"]} →
			</a>
		</>
	);
}

function BerufCard({
	occupation,
	vacancies,
	distance,
	loading,
}: BerufCardProps) {
	return (
		<div className="bg-white rounded-2xl border border-gray-200 p-4">
			<h3 className="text-lg font-semibold text-gray-900 mb-2">
				{occupation.name}
			</h3>
			{renderStellenContent(vacancies, distance, loading)}
		</div>
	);
}

export function FreiePlaetzePage() {
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
				{fetchError && (
					<p className="px-4 text-xs text-red-500">{fetchError}</p>
				)}

				<div className="flex-1 px-4 pb-4 space-y-3 overflow-y-auto">
					{visibleOccupations.length === 0 ? (
						<p className="text-sm text-gray-500">
							{content["freiePlaetze.noResults"]}
						</p>
					) : (
						visibleOccupations.map((occupation: MatchedOccupation) => (
							<BerufCard
								key={occupation.id}
								occupation={occupation}
								vacancies={vacanciesByName.get(occupation.rawName)}
								distance={location.distance}
								loading={loading}
							/>
						))
					)}
				</div>
			</div>
		</>
	);
}
