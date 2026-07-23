import { content } from "../../content";
import type { LocationFilterState } from "../filter-bottom-sheet/LocationFilterBottomSheet";
import {
	formatLocationFilterChipLabel,
	hasCustomLocationFilter,
} from "../filter-bottom-sheet/plzLocality";
import { FilterChipButton } from "../primitives/buttons/FilterChipButton";
import { getOccupationTagLabel } from "./utils/resultTagChips";

export interface ResultsFilterBarProps {
	hasLocationFilter: boolean;
	appliedLocationFilter?: LocationFilterState;
	selectedOccupationTypeTagIds?: string[];
	selectedOccupationIds?: number[];
	resolveOccupationFilterLabel?: (id: number) => string;
	occupationFilterTitle?: string;
	occupationFilterAriaLabel?: string;
	onOpenTagFilter: () => void;
	onOpenLocationFilter?: () => void;
	showFavoritesOnly: boolean;
	onToggleFavoritesOnly: () => void;
}

export function ResultsFilterBar({
	hasLocationFilter,
	appliedLocationFilter,
	selectedOccupationTypeTagIds = [],
	selectedOccupationIds,
	resolveOccupationFilterLabel,
	occupationFilterTitle,
	occupationFilterAriaLabel,
	onOpenTagFilter,
	onOpenLocationFilter,
	showFavoritesOnly,
	onToggleFavoritesOnly,
}: ResultsFilterBarProps) {
	const useOccupationFilter =
		selectedOccupationIds !== undefined &&
		resolveOccupationFilterLabel !== undefined;
	const activeFilterIds = useOccupationFilter
		? selectedOccupationIds
		: selectedOccupationTypeTagIds;
	const hasTagFilters = activeFilterIds.length > 0;
	const extraTagCount = activeFilterIds.length - 1;
	const filterTitle =
		occupationFilterTitle ?? content["results.filter.tags.title"];
	const filterAriaLabel =
		occupationFilterAriaLabel ??
		content["results.filter.tags.filterButton.ariaLabel"];
	let firstFilterLabel: string | null = null;
	if (hasTagFilters && useOccupationFilter) {
		firstFilterLabel = resolveOccupationFilterLabel(selectedOccupationIds[0]);
	} else if (hasTagFilters) {
		firstFilterLabel = getOccupationTagLabel(selectedOccupationTypeTagIds[0]);
	}
	const hasLocationApplied =
		appliedLocationFilter !== undefined &&
		hasCustomLocationFilter(appliedLocationFilter);
	const locationChipLabel = hasLocationApplied
		? formatLocationFilterChipLabel(appliedLocationFilter)
		: content["results.filter.location.title"];

	return (
		<div className="sticky top-[60px] z-10 bg-white px-4 py-[18px] flex gap-3 w-full">
			<div className="p-2 w-10 h-10 flex items-center justify-center">
				<img src="/icons/filter.svg" alt="" className="h-5 w-5 shrink-0" />
			</div>
			<div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{hasLocationFilter && (
					<FilterChipButton
						variant="dropdown"
						active={hasLocationApplied}
						onClick={onOpenLocationFilter ?? (() => {})}
						ariaLabel={
							content["results.filter.location.filterButton.ariaLabel"]
						}
						title={locationChipLabel}
					>
						<span className="min-w-0 flex-1 truncate">{locationChipLabel}</span>
					</FilterChipButton>
				)}
				<FilterChipButton
					variant="dropdown"
					active={hasTagFilters}
					onClick={onOpenTagFilter}
					ariaLabel={filterAriaLabel}
					title={filterTitle}
				>
					{hasTagFilters ? (
						<>
							<span className="min-w-0 max-w-[120px] flex-1 truncate">
								{firstFilterLabel}
							</span>
							{extraTagCount > 0 && (
								<span className="shrink-0">+{extraTagCount}</span>
							)}
						</>
					) : (
						<span className="min-w-0 flex-1 truncate">{filterTitle}</span>
					)}
				</FilterChipButton>
				<FilterChipButton
					active={showFavoritesOnly}
					onClick={onToggleFavoritesOnly}
					ariaPressed={showFavoritesOnly}
					ariaLabel={content["results.filter.favorites.filterButton.ariaLabel"]}
					title={content["results.filter.favorites.title"]}
				>
					<img
						src="/icons/favorite-outline.svg"
						alt=""
						className="h-4 w-4 shrink-0"
					/>
				</FilterChipButton>
			</div>
		</div>
	);
}
