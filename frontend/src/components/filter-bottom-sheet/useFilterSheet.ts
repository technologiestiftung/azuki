import { useCallback, useState } from "react";

export interface FilterSheetController<T> {
	isOpen: boolean;
	sheetKey: number;
	appliedValue: T;
	open: () => void;
	close: () => void;
	apply: (value: T) => void;
	reset: () => void;
}

/** Manages open/close, remount key, and applied filter state for a bottom sheet. */
export function useFilterSheet<T>(
	resetValue: T,
	initialValue: T = resetValue,
): FilterSheetController<T> {
	const [isOpen, setIsOpen] = useState(false);
	const [sheetKey, setSheetKey] = useState(0);
	const [appliedValue, setAppliedValue] = useState(initialValue);

	const open = useCallback(() => {
		setSheetKey((key) => key + 1);
		setIsOpen(true);
	}, []);

	const close = useCallback(() => {
		setIsOpen(false);
	}, []);

	const apply = useCallback((value: T) => {
		setAppliedValue(value);
	}, []);

	const reset = useCallback(() => {
		setAppliedValue(resetValue);
	}, [resetValue]);

	return {
		isOpen,
		sheetKey,
		appliedValue,
		open,
		close,
		apply,
		reset,
	};
}
