import { useCallback, useState, type UIEventHandler } from "react";

const COLLAPSE_START = 60;
const COLLAPSE_END = 180;
const MAX_OVERLAY_OPACITY = 0.45;

export function useOccupationDetailScroll() {
	const [scrollY, setScrollY] = useState(0);

	const onScroll: UIEventHandler<HTMLDivElement> = useCallback((event) => {
		setScrollY(event.currentTarget.scrollTop);
	}, []);

	const collapseProgress = Math.min(
		1,
		Math.max(0, (scrollY - COLLAPSE_START) / (COLLAPSE_END - COLLAPSE_START)),
	);
	const overlayOpacity = collapseProgress * MAX_OVERLAY_OPACITY;
	const heroControlsOpacity = 1 - collapseProgress;

	return { onScroll, collapseProgress, overlayOpacity, heroControlsOpacity };
}
