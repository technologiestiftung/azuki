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
	selectedOccupationTypeTagIds: string[];
	onOpenTagFilter: () => void;
	onOpenLocationFilter?: () => void;
	showFavoritesOnly: boolean;
	onToggleFavoritesOnly: () => void;
}

export function ResultsFilterBar({
	hasLocationFilter,
	appliedLocationFilter,
	selectedOccupationTypeTagIds,
	onOpenTagFilter,
	onOpenLocationFilter,
	showFavoritesOnly,
	onToggleFavoritesOnly,
}: ResultsFilterBarProps) {
	const hasTagFilters = selectedOccupationTypeTagIds.length > 0;
	const extraTagCount = selectedOccupationTypeTagIds.length - 1;
	const hasLocationApplied =
		appliedLocationFilter !== undefined &&
		hasCustomLocationFilter(appliedLocationFilter);
	const locationChipLabel = hasLocationApplied
		? formatLocationFilterChipLabel(appliedLocationFilter)
		: content["results.filter.location.title"];

	return (
		<div className="px-4 py-[18px] flex gap-3">
			<div className="p-2 w-10 h-10 flex items-center justify-center">
				<img src="/icons/filter.svg" alt="" className="h-5 w-5" />
			</div>
			<div className="flex items-center gap-2">
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
						<span className="min-w-0">{locationChipLabel}</span>
					</FilterChipButton>
				)}
				<FilterChipButton
					variant="dropdown"
					active={hasTagFilters}
					onClick={onOpenTagFilter}
					ariaLabel={content["results.filter.tags.filterButton.ariaLabel"]}
					title={content["results.filter.tags.title"]}
				>
					{hasTagFilters ? (
						<>
							<span className="min-w-0 max-w-[120px] flex-1 truncate">
								{getOccupationTagLabel(selectedOccupationTypeTagIds[0])}
							</span>
							{extraTagCount > 0 && (
								<span className="shrink-0">+{extraTagCount}</span>
							)}
						</>
					) : (
						<span className="min-w-0 flex-1 truncate">
							{hasLocationFilter
								? content["results.filter.tags.title.short"]
								: content["results.filter.tags.title"]}
						</span>
					)}
				</FilterChipButton>
				<FilterChipButton
					active={showFavoritesOnly}
					onClick={onToggleFavoritesOnly}
					ariaPressed={showFavoritesOnly}
					ariaLabel={content["results.filter.favorites.filterButton.ariaLabel"]}
					title={content["results.filter.favorites.title"]}
				>
					<img src="/icons/favorite-outline.svg" alt="" className="h-4 w-4" />
				</FilterChipButton>
			</div>
		</div>
	);
}
