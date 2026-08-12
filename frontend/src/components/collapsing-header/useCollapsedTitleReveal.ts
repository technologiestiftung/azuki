import { useCallback, useRef, useState } from "react";

const FADE_START_PX = 54;
const FADE_END_PX = 8;

export function useCollapsedTitleReveal() {
	const titleRef = useRef<HTMLHeadingElement>(null);
	const [titleRevealProgress, setTitleRevealProgress] = useState(0);

	const updateTitleReveal = useCallback((scrollContainer: HTMLDivElement) => {
		const titleEl = titleRef.current;
		if (!titleEl) {
			return;
		}

		const distanceFromTop =
			titleEl.getBoundingClientRect().bottom -
			scrollContainer.getBoundingClientRect().top;
		const progress =
			(FADE_START_PX - distanceFromTop) / (FADE_START_PX - FADE_END_PX);

		setTitleRevealProgress(Math.min(1, Math.max(0, progress)));
	}, []);

	return { titleRef, titleRevealProgress, updateTitleReveal };
}
