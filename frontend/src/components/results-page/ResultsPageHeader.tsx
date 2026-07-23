import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type ReactNode,
	type UIEvent,
} from "react";
import { SecondaryIconButton } from "../primitives/buttons/SecondaryIconButton";

export const COLLAPSED_HEADER_SCROLL_THRESHOLD = 64;

const COLLAPSED_HEADER_HEIGHT = 60;
const EXPANDED_TITLE_FONT_SIZE = 30;
const COLLAPSED_TITLE_FONT_SIZE = 16;
const EXPANDED_TITLE_LINE_HEIGHT = 36;
const COLLAPSED_TITLE_LINE_HEIGHT = 20;
const EXPANDED_TITLE_TOP = 54;
const COLLAPSED_TITLE_TOP = 18;
const EXPANDED_TITLE_LEFT = 18;
const COLLAPSED_TITLE_LEFT = 16;
const TITLE_RIGHT_PADDING = 112;
const EXPANDED_HEADER_BOTTOM_PADDING = 16;

export function useResultsPageScrollProgress() {
	const [scrollProgress, setScrollProgress] = useState(0);

	const handleListScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
		const { scrollTop } = event.currentTarget;
		setScrollProgress(
			Math.min(1, scrollTop / COLLAPSED_HEADER_SCROLL_THRESHOLD),
		);
	}, []);

	return { scrollProgress, handleListScroll };
}

interface ResultsPageHeaderProps {
	scrollProgress: number;
	title: ReactNode;
	shareAriaLabel: string;
	downloadAriaLabel: string;
}

export function ResultsPageHeader({
	scrollProgress,
	title,
	shareAriaLabel,
	downloadAriaLabel,
}: ResultsPageHeaderProps) {
	const measureTitleRef = useRef<HTMLHeadingElement>(null);
	const [expandedHeaderHeight, setExpandedHeaderHeight] = useState(0);

	useEffect(() => {
		const element = measureTitleRef.current;

		if (!element) {
			return;
		}

		const updateHeight = () => {
			setExpandedHeaderHeight(
				EXPANDED_TITLE_TOP + element.offsetHeight + EXPANDED_HEADER_BOTTOM_PADDING,
			);
		};

		updateHeight();

		const resizeObserver = new ResizeObserver(updateHeight);
		resizeObserver.observe(element);

		return () => {
			resizeObserver.disconnect();
		};
	}, [title]);

	const expandedHeight =
		expandedHeaderHeight > 0 ? expandedHeaderHeight : COLLAPSED_HEADER_HEIGHT;
	const currentHeight =
		expandedHeight -
		scrollProgress * (expandedHeight - COLLAPSED_HEADER_HEIGHT);
	const titleTop =
		EXPANDED_TITLE_TOP -
		scrollProgress * (EXPANDED_TITLE_TOP - COLLAPSED_TITLE_TOP);
	const titleLeft =
		EXPANDED_TITLE_LEFT -
		scrollProgress * (EXPANDED_TITLE_LEFT - COLLAPSED_TITLE_LEFT);
	const titleFontSize =
		EXPANDED_TITLE_FONT_SIZE -
		scrollProgress * (EXPANDED_TITLE_FONT_SIZE - COLLAPSED_TITLE_FONT_SIZE);
	const titleLineHeight =
		EXPANDED_TITLE_LINE_HEIGHT -
		scrollProgress * (EXPANDED_TITLE_LINE_HEIGHT - COLLAPSED_TITLE_LINE_HEIGHT);
	const buttonBackgroundOpacity = 1 - scrollProgress;

	return (
		<div
			className="sticky top-0 z-20 shrink-0 overflow-hidden border-b border-sky-20 bg-white"
			style={{ height: `${currentHeight}px` }}
		>
			<div className="absolute right-4 top-3 z-10 flex gap-1.5">
				<SecondaryIconButton
					iconSrc="/icons/download.svg"
					ariaLabel={downloadAriaLabel}
					style={{
						backgroundColor: `rgba(209, 213, 219, ${buttonBackgroundOpacity})`,
					}}
				/>
				<SecondaryIconButton
					iconSrc="/icons/share.svg"
					ariaLabel={shareAriaLabel}
					style={{
						backgroundColor: `rgba(209, 213, 219, ${buttonBackgroundOpacity})`,
					}}
				/>
			</div>

			<h1
				className="absolute font-semibold text-sky-900 text-left"
				style={{
					top: `${titleTop}px`,
					left: `${titleLeft}px`,
					right: `${TITLE_RIGHT_PADDING}px`,
					fontSize: `${titleFontSize}px`,
					lineHeight: `${titleLineHeight}px`,
				}}
			>
				{title}
			</h1>

			<h1
				ref={measureTitleRef}
				className="pointer-events-none absolute opacity-0 font-semibold text-sky-900 text-left"
				style={{
					top: `${EXPANDED_TITLE_TOP}px`,
					left: `${EXPANDED_TITLE_LEFT}px`,
					right: `${TITLE_RIGHT_PADDING}px`,
					fontSize: `${EXPANDED_TITLE_FONT_SIZE}px`,
					lineHeight: `${EXPANDED_TITLE_LINE_HEIGHT}px`,
				}}
				aria-hidden="true"
			>
				{title}
			</h1>
		</div>
	);
}
