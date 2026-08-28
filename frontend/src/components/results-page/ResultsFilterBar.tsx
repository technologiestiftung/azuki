import { content } from "../../content";
import type { LocationFilterState } from "../filter-bottom-sheet/LocationFilterBottomSheet";
import {
	formatLocationFilterChipLabel,
	hasCustomLocationFilter,
} from "../filter-bottom-sheet/plzLocality";
import { FilterChipButton } from "../primitives/buttons/FilterChipButton";
import { COLLAPSED_THRESHOLD } from "../collapsing-header/CollapsingHeaderTopRow";
import { TOP_ROW_HEIGHT_PX } from "./ResultsPageHeader";
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
	/** 0–1 scroll progress; drives collapse border visibility. */
	scrollProgress?: number;
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
	scrollProgress = 0,
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
	const collapsed = scrollProgress > COLLAPSED_THRESHOLD;

	return (
		<div
			className={`sticky z-20 px-4 py-2 flex gap-3 w-full bg-white transition-[border-color] duration-150 ease-[cubic-bezier(0.25,0,0.25,1)] ${
				collapsed
					? "border-b-2 border-sky-shade-20"
					: "border-b-2 border-transparent"
			}`}
			style={{ top: TOP_ROW_HEIGHT_PX }}
		>
			<div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pl-1">
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
