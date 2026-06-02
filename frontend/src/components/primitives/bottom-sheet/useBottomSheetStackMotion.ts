import { useLayoutEffect, useState, type RefObject } from "react";

export type BottomSheetStackTier = "default" | "elevated";

export const STACKED_BEHIND_SCALE = 0.92;

export const STACK_PEEK_GAP_PX = -15;

export function computeStackedBehindTranslateY(
	behindShellHeight: number,
	stackFrontHeight: number,
): number {
	if (behindShellHeight <= 0 || stackFrontHeight <= 0) {
		return 0;
	}

	return (
		behindShellHeight * STACKED_BEHIND_SCALE -
		stackFrontHeight -
		STACK_PEEK_GAP_PX
	);
}

export function useBottomSheetStackMotion({
	motionShellRef,
	isStackedBehind,
	stackTier,
	visible,
	enterComplete,
	stackFrontHeight,
	stackedBehindTranslateY,
	onShellHeightChange,
}: {
	motionShellRef: RefObject<HTMLDivElement | null>;
	isStackedBehind: boolean;
	stackTier: BottomSheetStackTier;
	visible: boolean;
	enterComplete: boolean;
	stackFrontHeight: number;

	stackedBehindTranslateY?: number;
	onShellHeightChange?: (height: number) => void;
}) {
	const [behindShellHeight, setBehindShellHeight] = useState(0);
	const useAutoStackOffset = stackedBehindTranslateY === undefined;

	useLayoutEffect(() => {
		if (!isStackedBehind || !visible || !useAutoStackOffset) {
			setBehindShellHeight(0);
			return undefined;
		}
		const el = motionShellRef.current;
		if (!el) {
			return undefined;
		}
		const measure = () => setBehindShellHeight(el.offsetHeight);
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		return () => observer.disconnect();
	}, [
		isStackedBehind,
		visible,
		enterComplete,
		motionShellRef,
		useAutoStackOffset,
	]);

	useLayoutEffect(() => {
		if (stackTier !== "elevated" || !visible || !onShellHeightChange) {
			return undefined;
		}
		const el = motionShellRef.current;
		if (!el) {
			return undefined;
		}
		const measure = () => onShellHeightChange(el.offsetHeight);
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		return () => {
			observer.disconnect();
			onShellHeightChange(0);
		};
	}, [stackTier, visible, enterComplete, motionShellRef, onShellHeightChange]);

	let stackedBehindTranslateYpx = 0;
	if (isStackedBehind) {
		if (stackedBehindTranslateY !== undefined) {
			stackedBehindTranslateYpx = stackedBehindTranslateY;
		} else {
			stackedBehindTranslateYpx = computeStackedBehindTranslateY(
				behindShellHeight,
				stackFrontHeight,
			);
		}
	}

	return { stackedBehindTranslateYpx };
}
