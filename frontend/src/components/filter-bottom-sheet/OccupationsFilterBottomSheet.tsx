import { useCallback, useState } from "react";
import { content } from "../../content";
import { SelectableRowButton } from "../primitives/buttons/SelectableRowButton";
import { FilterBottomSheetShell } from "./FilterBottomSheetShell";

export interface FilterOccupationChip {
	id: number;
	label: string;
}

export interface OccupationsFilterState {
	selectedOccupationIds: number[];
}

export interface OccupationsFilterBottomSheetProps {
	open: boolean;
	onClose: () => void;
	initialFilters?: Partial<OccupationsFilterState>;
	occupationChips?: FilterOccupationChip[];
	onApply?: (state: OccupationsFilterState) => void;
	onReset?: () => void;
}

export function OccupationsFilterBottomSheet({
	open,
	onClose,
	initialFilters,
	occupationChips,
	onApply,
	onReset,
}: OccupationsFilterBottomSheetProps) {
	const [selectedOccupationIds, setSelectedOccupationIds] = useState<
		Set<number>
	>(() => new Set(initialFilters?.selectedOccupationIds ?? []));

	const toggleChip = useCallback((id: number) => {
		setSelectedOccupationIds((prev) => {
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
		setSelectedOccupationIds(new Set());
		onReset?.();
	};

	const handleApply = () => {
		onApply?.({
			selectedOccupationIds: [...selectedOccupationIds],
		});
		onClose();
	};

	return (
		<FilterBottomSheetShell
			open={open}
			onClose={onClose}
			title={content["vacancies.filter.occupations.title.short"]}
			ariaLabel={content["vacancies.filter.occupations.title.short"]}
			onReset={handleReset}
			resetDisabled={selectedOccupationIds.size === 0}
			onApply={handleApply}
		>
			<div className="flex flex-col min-w-0 gap-2 px-4 pt-4 pb-8">
				{occupationChips?.map((chip) => {
					const selected = selectedOccupationIds.has(chip.id);
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
