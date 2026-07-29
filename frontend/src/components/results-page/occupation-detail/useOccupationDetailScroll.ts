import { useCallback, useState, type UIEventHandler } from "react";

export const COLLAPSE_START = 60;
export const COLLAPSE_END = 180;
const HERO_PARALLAX_MAX_PX = 18;

export function useOccupationDetailScroll() {
	const [scrollY, setScrollY] = useState(0);

	const onScroll: UIEventHandler<HTMLDivElement> = useCallback((event) => {
		setScrollY(event.currentTarget.scrollTop);
	}, []);

	const collapseProgress = Math.min(
		1,
		Math.max(0, (scrollY - COLLAPSE_START) / (COLLAPSE_END - COLLAPSE_START)),
	);
	const overlayOpacity = collapseProgress;
	const heroControlsOpacity = 1 - collapseProgress;
	const heroImageParallaxY = Math.min(
		HERO_PARALLAX_MAX_PX,
		(scrollY / COLLAPSE_END) * HERO_PARALLAX_MAX_PX,
	);

	return {
		onScroll,
		collapseProgress,
		overlayOpacity,
		heroControlsOpacity,
		heroImageParallaxY,
	};
}
