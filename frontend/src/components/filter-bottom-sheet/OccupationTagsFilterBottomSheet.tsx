import { useCallback, useState } from "react";
import { content } from "../../content";
import { SelectableRowButton } from "../primitives/buttons/SelectableRowButton";
import { FilterBottomSheetShell } from "./FilterBottomSheetShell";

export interface FilterOccupationTypeTagChip {
	id: string;
	label: string;
}

export interface OccupationTagsFilterState {
	selectedOccupationTypeTagIds: string[];
}

export interface OccupationTagsFilterBottomSheetProps {
	open: boolean;
	onClose: () => void;
	initialFilters?: Partial<OccupationTagsFilterState>;
	occupationTypeTagChips?: FilterOccupationTypeTagChip[];
	onApply?: (state: OccupationTagsFilterState) => void;
	onReset?: () => void;
}

export function OccupationTagsFilterBottomSheet({
	open,
	onClose,
	initialFilters,
	occupationTypeTagChips,
	onApply,
	onReset,
}: OccupationTagsFilterBottomSheetProps) {
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
		setSelectedOccupationTypeTagIds(new Set());
		onReset?.();
	};

	const handleApply = () => {
		onApply?.({
			selectedOccupationTypeTagIds: [...selectedOccupationTypeTagIds],
		});
		onClose();
	};

	return (
		<FilterBottomSheetShell
			open={open}
			onClose={onClose}
			title={content["results.filter.tags.title"]}
			ariaLabel={content["results.filter.tags.title"]}
			onReset={handleReset}
			onApply={handleApply}
		>
			<div className="flex flex-col min-w-0 gap-2 px-4 pt-4 pb-8">
				{occupationTypeTagChips?.map((chip) => {
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
		</FilterBottomSheetShell>
	);
}
