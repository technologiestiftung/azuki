import { useCallback, useEffect, useRef, useState } from "react";
import { GhostIconButton } from "../primitives/buttons/GhostIconButton";
import { BottomSheet } from "../primitives/bottom-sheet/BottomSheet";
import { SecondaryButton } from "../primitives/buttons/SecondaryButton";
import { content } from "../../content";
import { ToggleButton } from "../primitives/buttons/ToggleButton";
import { Pill } from "../primitives/buttons/Pill";
import { PrimaryThemedButton } from "../primitives/buttons/PrimaryThemedButton";

export interface FilterOccupationTypeChip {
	id: string;
	label: string;
	emoji?: string;
}

export interface FilterBottomSheetState {
	showFavoritesOnly: boolean;
	selectedOccupationTypeIds: string[];
}

export function getAppliedFilterCount(filters: FilterBottomSheetState): number {
	let count = 0;
	if (filters.showFavoritesOnly) {
		count++;
	}
	count += filters.selectedOccupationTypeIds.length;
	return count;
}

export interface FilterBottomSheetProps {
	open: boolean;
	onClose: () => void;
	initialFilters?: Partial<FilterBottomSheetState>;
	occupationTypeChips?: FilterOccupationTypeChip[];
	onApply?: (state: FilterBottomSheetState) => void;
	onReset?: () => void;
	onOpenSettings?: () => void;
}

export function FilterBottomSheet({
	open,
	onClose,
	initialFilters,
	occupationTypeChips,
	onApply,
	onReset,
}: FilterBottomSheetProps) {
	const [showFavoritesOnly, setShowFavoritesOnly] = useState(
		initialFilters?.showFavoritesOnly ?? false,
	);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(
		() => new Set(initialFilters?.selectedOccupationTypeIds ?? []),
	);

	const wasOpen = useRef(false);
	useEffect(() => {
		if (open && !wasOpen.current) {
			setShowFavoritesOnly(initialFilters?.showFavoritesOnly ?? false);
			setSelectedIds(new Set(initialFilters?.selectedOccupationTypeIds ?? []));
		}
		wasOpen.current = open;
	}, [open, initialFilters]);

	const toggleChip = useCallback((id: string) => {
		setSelectedIds((prev) => {
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
		setSelectedIds(new Set());
		onReset?.();
	};

	const handleApply = () => {
		onApply?.({
			showFavoritesOnly,
			selectedOccupationTypeIds: [...selectedIds],
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
				<div className="flex gap-3">
					<SecondaryButton
						type="button"
						className="min-w-0 flex-1"
						onClick={handleReset}
					>
						{content["results.filter.reset"]}
					</SecondaryButton>
					<PrimaryThemedButton
						onClick={handleApply}
						ariaLabel={content["results.filter.apply"]}
						title={content["results.filter.apply"]}
						className="min-w-0 flex-1"
					>
						{content["results.filter.apply"]}
					</PrimaryThemedButton>
				</div>
			}
		>
			<div className="flex items-center justify-between gap-2 py-2 px-4">
				<GhostIconButton
					onClick={onClose}
					ariaLabel={content["results.filter.close"]}
					iconSrc="/icons/close-black.svg"
				/>

				<h2 className="flex-1 text-center text-lg font-semibold text-gray-900">
					{content["results.filter.title"]}
				</h2>
				<div className="w-10 h-10" />
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
			{occupationTypeChips && occupationTypeChips.length > 0 && (
				<h3 className="pl-5 pr-4 pt-6 text-2xl font-semibold text-gray-900">
					{content["results.filter.occupationTypeSection"]}
				</h3>
			)}

			<div className="flex min-w-0 flex-wrap gap-x-2 gap-y-3 px-4 pt-4 pb-8">
				{occupationTypeChips?.map((chip) => {
					const selected = selectedIds.has(chip.id);
					return (
						<Pill
							label={chip.label}
							icon={chip.emoji}
							selected={selected}
							key={chip.id}
							onClick={() => toggleChip(chip.id)}
							ariaLabel={chip.label}
						/>
					);
				})}
			</div>
		</BottomSheet>
	);
}
