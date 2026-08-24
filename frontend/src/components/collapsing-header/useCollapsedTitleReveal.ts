import { useCallback, useRef, useState } from "react";

const DEFAULT_FADE_START_PX = 54;
const DEFAULT_FADE_END_PX = 8;

export type CollapsedTitleRevealOptions = {
	fadeStartPx?: number;
	fadeEndPx?: number;
};

export function useCollapsedTitleReveal(
	options: CollapsedTitleRevealOptions = {},
) {
	const fadeStartPx = options.fadeStartPx ?? DEFAULT_FADE_START_PX;
	const fadeEndPx = options.fadeEndPx ?? DEFAULT_FADE_END_PX;

	const titleRef = useRef<HTMLHeadingElement>(null);
	const progressRef = useRef(0);
	const [titleRevealProgress, setTitleRevealProgress] = useState(0);

	const updateTitleReveal = useCallback(
		(scrollContainer: HTMLDivElement) => {
			const titleEl = titleRef.current;
			if (!titleEl) {
				return;
			}

			const distanceFromTop =
				titleEl.getBoundingClientRect().bottom -
				scrollContainer.getBoundingClientRect().top;
			const progress =
				(fadeStartPx - distanceFromTop) / (fadeStartPx - fadeEndPx);
			const next = Math.min(1, Math.max(0, progress));

			if (Math.abs(next - progressRef.current) < 0.01) {
				return;
			}
			progressRef.current = next;
			setTitleRevealProgress(next);
		},
		[fadeStartPx, fadeEndPx],
	);

	const resetTitleReveal = useCallback(() => {
		progressRef.current = 0;
		setTitleRevealProgress(0);
	}, []);

	return {
		titleRef,
		titleRevealProgress,
		updateTitleReveal,
		resetTitleReveal,
	};
}
