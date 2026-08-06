import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type CSSProperties,
	type RefObject,
} from "react";

type TitleRect = {
	left: number;
	top: number;
	width: number;
};

export type TitleMorphMetrics = {
	heroFontSizePx: number;
	collapsedFontSizePx: number;
	heroLineHeightPx: number;
	collapsedLineHeightPx: number;
	/** Clamp morphing title top so it never goes above this (e.g. collapsed bar padding). */
	minTopPx?: number;
};

export type TitleMorphResult = {
	heroTitleSlotRef: RefObject<HTMLDivElement>;
	collapsedTitleSlotRef: RefObject<HTMLDivElement>;
	isMorphing: boolean;
	titleStyle: CSSProperties | undefined;
	/** Drive the morph with a 0–1 progress value. */
	syncMorphTitle: (progress: number) => void;
};

/**
 * Morphs a page title from a hero slot into a collapsed-header slot while scrolling.
 * Used by About, Profile, and Results headers.
 */
export function useTitleMorph({
	heroFontSizePx,
	collapsedFontSizePx,
	heroLineHeightPx,
	collapsedLineHeightPx,
	minTopPx,
}: TitleMorphMetrics): TitleMorphResult {
	const heroTitleSlotRef = useRef<HTMLDivElement>(null);
	const collapsedTitleSlotRef = useRef<HTMLDivElement>(null);
	const morphOriginRef = useRef<TitleRect | null>(null);
	const progressRef = useRef(0);
	const [isMorphing, setIsMorphing] = useState(false);
	const [titleStyle, setTitleStyle] = useState<CSSProperties | undefined>();

	const syncMorphTitle = useCallback(
		(progress: number) => {
			progressRef.current = progress;
			const fromEl = heroTitleSlotRef.current;
			const toEl = collapsedTitleSlotRef.current;
			if (!fromEl || !toEl) {
				return;
			}

			// Below threshold: title stays in normal hero flow — no fixed morph.
			if (progress <= 0) {
				morphOriginRef.current = null;
				setIsMorphing(false);
				setTitleStyle(undefined);
				return;
			}

			// Freeze start position when morph begins so the title peels off
			// from where it was in the hero, then travels to the header.
			if (!morphOriginRef.current) {
				const rect = fromEl.getBoundingClientRect();
				morphOriginRef.current = {
					left: rect.left,
					top: rect.top,
					width: rect.width,
				};
			}

			const from = morphOriginRef.current;
			const to = toEl.getBoundingClientRect();
			const morphTop = from.top + (to.top - from.top) * progress;

			setIsMorphing(true);
			setTitleStyle({
				position: "fixed",
				left: from.left + (to.left - from.left) * progress,
				top: minTopPx !== undefined ? Math.max(minTopPx, morphTop) : morphTop,
				width: from.width + (to.width - from.width) * progress,
				fontSize:
					heroFontSizePx + (collapsedFontSizePx - heroFontSizePx) * progress,
				lineHeight: `${
					heroLineHeightPx +
					(collapsedLineHeightPx - heroLineHeightPx) * progress
				}px`,
				zIndex: 40,
				pointerEvents: "none",
				margin: 0,
			});
		},
		[
			heroFontSizePx,
			collapsedFontSizePx,
			heroLineHeightPx,
			collapsedLineHeightPx,
			minTopPx,
		],
	);

	useEffect(() => {
		const onResize = () => {
			morphOriginRef.current = null;
			syncMorphTitle(progressRef.current);
		};
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, [syncMorphTitle]);

	return {
		heroTitleSlotRef: heroTitleSlotRef as RefObject<HTMLDivElement>,
		collapsedTitleSlotRef: collapsedTitleSlotRef as RefObject<HTMLDivElement>,
		isMorphing,
		titleStyle,
		syncMorphTitle,
	};
}
