import {
	useCallback,
	useLayoutEffect,
	useRef,
	useState,
	type ReactNode,
	type UIEvent,
} from "react";
import { SecondaryIconButton } from "../primitives/buttons/SecondaryIconButton";

const EXPANDED_HEADER_HEIGHT = 10.75;
const COLLAPSED_HEADER_HEIGHT = 7.5;
const HEADER_COLLAPSE_DISTANCE =
	EXPANDED_HEADER_HEIGHT - COLLAPSED_HEADER_HEIGHT;
const EXPANDED_TITLE_FONT_SIZE = 1.875;
const COLLAPSED_TITLE_FONT_SIZE = 1;
const EXPANDED_TITLE_TOP = 4;
const COLLAPSED_TITLE_TOP = 1.3;

export const RESULTS_PAGE_HEADER_EXPANDED_HEIGHT =
	"var(--results-page-header-expanded-height, 10.75rem)";

// Change easing here: cubic-bezier(x1, y1, x2, y2); x = timing, y = motion progress.
const HEADER_EASING = [0.25, 0, 0.25, 1] as const;

function sampleCubicBezier(t: number, point1: number, point2: number) {
	const inverseT = 1 - t;
	return (
		3 * inverseT * inverseT * t * point1 +
		3 * inverseT * t * t * point2 +
		t * t * t
	);
}

function easeHeaderProgress(progress: number) {
	const [x1, y1, x2, y2] = HEADER_EASING;
	let lower = 0;
	let upper = 1;

	for (let iteration = 0; iteration < 12; iteration += 1) {
		const midpoint = (lower + upper) / 2;
		const x = sampleCubicBezier(midpoint, x1, x2);

		if (x < progress) {
			lower = midpoint;
		} else {
			upper = midpoint;
		}
	}

	return sampleCubicBezier((lower + upper) / 2, y1, y2);
}

export function useResultsPageScrollProgress() {
	const [scrollProgress, setScrollProgress] = useState(0);

	const handleListScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
		const { scrollTop } = event.currentTarget;
		const rootFontSize = Number.parseFloat(
			getComputedStyle(document.documentElement).fontSize,
		);
		const expandedHeight = Number.parseFloat(
			getComputedStyle(event.currentTarget).getPropertyValue(
				"--results-page-header-expanded-height",
			),
		);
		const collapseDistance = Number.isNaN(expandedHeight)
			? HEADER_COLLAPSE_DISTANCE * rootFontSize
			: expandedHeight - COLLAPSED_HEADER_HEIGHT * rootFontSize;
		const progress = Math.max(0, Math.min(1, scrollTop / collapseDistance));
		setScrollProgress(easeHeaderProgress(progress));
	}, []);

	return { scrollProgress, handleListScroll };
}

interface ResultsPageHeaderProps {
	scrollProgress: number;
	title: ReactNode;
	shareAriaLabel: string;
	downloadAriaLabel: string;
	children: ReactNode;
}

export function ResultsPageHeader({
	scrollProgress,
	title,
	shareAriaLabel,
	downloadAriaLabel,
	children,
}: ResultsPageHeaderProps) {
	const measureTitleRef = useRef<HTMLHeadingElement>(null);
	const titleRef = useRef<HTMLHeadingElement>(null);
	const headerRef = useRef<HTMLDivElement>(null);
	const [currentTitleExtraHeight, setCurrentTitleExtraHeight] = useState(0);

	useLayoutEffect(() => {
		const measureTitleElement = measureTitleRef.current;
		const titleElement = titleRef.current;
		const parentElement = headerRef.current?.parentElement;

		if (!measureTitleElement || !titleElement || !parentElement) {
			return () => {};
		}

		const updateExpandedHeight = () => {
			const rootFontSize = Number.parseFloat(
				getComputedStyle(document.documentElement).fontSize,
			);
			const singleLineHeight = EXPANDED_TITLE_FONT_SIZE * 1.3 * rootFontSize;
			const extraHeight = Math.max(
				0,
				measureTitleElement.getBoundingClientRect().height - singleLineHeight,
			);

			parentElement.style.setProperty(
				"--results-page-header-expanded-height",
				`${EXPANDED_HEADER_HEIGHT * rootFontSize + extraHeight}px`,
			);
		};
		const updateCurrentTitleHeight = () => {
			const lineHeight = Number.parseFloat(
				getComputedStyle(titleElement).lineHeight,
			);
			setCurrentTitleExtraHeight(
				Math.max(0, titleElement.getBoundingClientRect().height - lineHeight),
			);
		};

		updateExpandedHeight();
		updateCurrentTitleHeight();
		const resizeObserver = new ResizeObserver(updateExpandedHeight);
		const currentTitleResizeObserver = new ResizeObserver(
			updateCurrentTitleHeight,
		);
		resizeObserver.observe(measureTitleElement);
		currentTitleResizeObserver.observe(titleElement);

		return () => {
			resizeObserver.disconnect();
			currentTitleResizeObserver.disconnect();
		};
	}, [title]);

	const currentHeight =
		EXPANDED_HEADER_HEIGHT -
		scrollProgress * (EXPANDED_HEADER_HEIGHT - COLLAPSED_HEADER_HEIGHT);
	const currentExtraHeight = currentTitleExtraHeight;
	const titleTop =
		EXPANDED_TITLE_TOP -
		scrollProgress * (EXPANDED_TITLE_TOP - COLLAPSED_TITLE_TOP);
	const titleRight = 16 + scrollProgress * 86;
	const titleFontSize =
		EXPANDED_TITLE_FONT_SIZE -
		scrollProgress * (EXPANDED_TITLE_FONT_SIZE - COLLAPSED_TITLE_FONT_SIZE);
	const titleLineHeight = 1.3 + scrollProgress * 0.1;
	// The same buttons become ghost-style as their secondary background fades to transparent.
	const actionButtonBackground = `rgba(228, 232, 235, ${1 - scrollProgress})`;

	return (
		<div
			ref={headerRef}
			className={`absolute inset-x-0 top-0 z-20 overflow-hidden border-b bg-gradient-to-b from-white to-sky-white ${
				scrollProgress === 1 ? "border-sky-shade-20" : "border-transparent"
			}`}
			style={{ height: `calc(${currentHeight}rem + ${currentExtraHeight}px)` }}
		>
			<div className="absolute right-4 top-3 z-10 flex gap-1.5">
				<SecondaryIconButton
					iconSrc="/icons/download.svg"
					ariaLabel={downloadAriaLabel}
					style={{ backgroundColor: actionButtonBackground }}
				/>
				<SecondaryIconButton
					iconSrc="/icons/share.svg"
					ariaLabel={shareAriaLabel}
					style={{ backgroundColor: actionButtonBackground }}
				/>
			</div>

			<h1
				ref={titleRef}
				className="absolute left-4 break-words text-left font-semibold text-sky-900"
				style={{
					top: `${titleTop}rem`,
					right: `${titleRight / 16}rem`,
					fontSize: `${titleFontSize}rem`,
					lineHeight: titleLineHeight,
					willChange: "top, font-size, line-height",
				}}
			>
				{title}
			</h1>

			<h1
				ref={measureTitleRef}
				className="pointer-events-none invisible absolute left-4 right-4 top-16 break-words text-left font-semibold text-sky-900"
				style={{
					fontSize: `${EXPANDED_TITLE_FONT_SIZE}rem`,
					lineHeight: 1.3,
				}}
				aria-hidden="true"
			>
				{title}
			</h1>

			<div
				className="absolute inset-x-0 top-16"
				style={{ transform: `translateY(${currentExtraHeight}px)` }}
			>
				{children}
			</div>
		</div>
	);
}
