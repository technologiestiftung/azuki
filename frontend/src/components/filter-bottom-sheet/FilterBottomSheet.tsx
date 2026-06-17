import { useCallback, useState } from "react";
import { GhostIconButton } from "../primitives/buttons/GhostIconButton";
import { BottomSheet } from "../primitives/bottom-sheet/BottomSheet";
import { content } from "../../content";
import { ToggleButton } from "../primitives/buttons/ToggleButton";
import { PrimaryButton } from "../primitives/buttons/PrimaryButton";
import { SelectableRowButton } from "../primitives/buttons/SelectableRowButton";

export interface FilterOccupationTypeTagChip {
	id: string;
	label: string;
}

export interface FilterBottomSheetState {
	showFavoritesOnly: boolean;
	selectedOccupationTypeTagIds: string[];
}

export function getAppliedFilterCount(filters: FilterBottomSheetState): number {
	let count = 0;
	if (filters.showFavoritesOnly) {
		count++;
	}
	count += filters.selectedOccupationTypeTagIds.length;
	return count;
}

export interface FilterBottomSheetProps {
	open: boolean;
	onClose: () => void;
	initialFilters?: Partial<FilterBottomSheetState>;
	occupationTypeTagChips?: FilterOccupationTypeTagChip[];
	onApply?: (state: FilterBottomSheetState) => void;
	onReset?: () => void;
	onOpenSettings?: () => void;
}

export function FilterBottomSheet({
	open,
	onClose,
	initialFilters,
	occupationTypeTagChips,
	onApply,
	onReset,
}: FilterBottomSheetProps) {
	const [showFavoritesOnly, setShowFavoritesOnly] = useState(
		initialFilters?.showFavoritesOnly ?? false,
	);
	const [selectedOccupationTypeTagIds, setSelectedOccupationTypeTagIds] =
		useState<Set<string>>(
			() => new Set(initialFilters?.selectedOccupationTypeTagIds ?? []),
		);

	const toggleChip = useCallback((id: string) => {
		setSelectedOccupationTypeTagIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	}, []);

	const handleReset = () => {
		setShowFavoritesOnly(false);
		setSelectedOccupationTypeTagIds(new Set());
		onReset?.();
	};

	const handleApply = () => {
		onApply?.({
			showFavoritesOnly,
			selectedOccupationTypeTagIds: [...selectedOccupationTypeTagIds],
		});
		onClose();
	};

	return (
		<BottomSheet
			open={open}
			onClose={onClose}
			ariaLabel={content["results.filter.title"]}
			overlayDismissLabel={content["results.filter.dismissOverlay"]}
			footer={
				<PrimaryButton
					onClick={handleApply}
					ariaLabel={content["results.filter.apply"]}
					title={content["results.filter.apply"]}
					className="min-w-0 flex-1"
				>
					{content["results.filter.apply"]}
				</PrimaryButton>
			}
		>
			<div className="relative flex items-center justify-between py-2 px-4">
				<GhostIconButton
					className="relative z-10"
					onClick={onClose}
					ariaLabel={content["results.filter.close"]}
					iconSrc="/icons/arrow-back-black.svg"
				/>

				<h2 className="pointer-events-none absolute inset-x-4 text-center text-lg font-semibold text-gray-900">
					{content["results.filter.title"]}
				</h2>

				<button
					type="button"
					onClick={handleReset}
					aria-label={content["results.filter.reset"]}
					title={content["results.filter.reset"]}
					className="relative z-10 shrink-0 px-4 text-base font-medium text-gray-400 transition-colors rounded-2xl h-12 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 md:hover:bg-gray-200 md:hover:text-gray-800 active:bg-gray-200 active:text-gray-800"
				>
					{content["results.filter.reset"]}
				</button>
			</div>

			<div className="flex items-center justify-between px-4 pt-4">
				<span className="text-lg text-gray-900">
					{content["results.filter.showFavorites"]}
				</span>

				<ToggleButton
					checked={showFavoritesOnly}
					onChange={(next) => setShowFavoritesOnly(next)}
				/>
			</div>
			{(occupationTypeTagChips?.length ?? 0) > 0 && (
				<h3 className="pl-5 pr-4 pt-6 text-2xl font-semibold text-gray-900">
					{content["results.filter.tagSection"]}
				</h3>
			)}

			<div className="flex flex-col min-w-0 gap-2 px-4 pt-4 pb-8">
				{occupationTypeTagChips?.map((chip: FilterOccupationTypeTagChip) => {
					const selected = selectedOccupationTypeTagIds.has(chip.id);
					return (
						<SelectableRowButton
							key={chip.id}
							label={chip.label}
							selected={selected}
							onClick={() => toggleChip(chip.id)}
							ariaLabel={chip.label}
						/>
					);
				})}
			</div>
		</BottomSheet>
	);
}
