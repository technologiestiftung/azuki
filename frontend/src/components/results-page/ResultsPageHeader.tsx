import {
	useCallback,
	useState,
	type HTMLAttributes,
	type ReactNode,
	type UIEvent,
} from "react";
import { GhostIconButton } from "../primitives/buttons/GhostIconButton";
import { SecondaryIconButton } from "../primitives/buttons/SecondaryIconButton";

const EXPANDED_HEADER_HEIGHT = 10.75;
const COLLAPSED_HEADER_HEIGHT = 7.5;
const HEADER_COLLAPSE_DISTANCE =
	EXPANDED_HEADER_HEIGHT - COLLAPSED_HEADER_HEIGHT;
const EXPANDED_TITLE_FONT_SIZE = 1.875;
const COLLAPSED_TITLE_FONT_SIZE = 1;
const EXPANDED_TITLE_TOP = 4;
const COLLAPSED_TITLE_TOP = 1.3;

export const RESULTS_PAGE_HEADER_EXPANDED_HEIGHT = `${EXPANDED_HEADER_HEIGHT}rem`;

function sampleCubicBezier(t: number, point1: number, point2: number) {
	const inverseT = 1 - t;
	return (
		3 * inverseT * inverseT * t * point1 +
		3 * inverseT * t * t * point2 +
		t * t * t
	);
}

function easeHeaderProgress(progress: number) {
	let lower = 0;
	let upper = 1;

	for (let iteration = 0; iteration < 12; iteration += 1) {
		const midpoint = (lower + upper) / 2;
		const x = sampleCubicBezier(midpoint, 0.72, 0.36);

		if (x < progress) {
			lower = midpoint;
		} else {
			upper = midpoint;
		}
	}

	return sampleCubicBezier((lower + upper) / 2, 0, 1);
}

export function useResultsPageScrollProgress() {
	const [scrollProgress, setScrollProgress] = useState(0);

	const handleListScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
		const { scrollTop } = event.currentTarget;
		const rootFontSize = Number.parseFloat(
			getComputedStyle(document.documentElement).fontSize,
		);
		const collapseDistance = HEADER_COLLAPSE_DISTANCE * rootFontSize;
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
	const currentHeight =
		EXPANDED_HEADER_HEIGHT -
		scrollProgress * (EXPANDED_HEADER_HEIGHT - COLLAPSED_HEADER_HEIGHT);
	const titleTop =
		EXPANDED_TITLE_TOP -
		scrollProgress * (EXPANDED_TITLE_TOP - COLLAPSED_TITLE_TOP);
	const titleRight = 16 + scrollProgress * 86;
	const titleFontSize =
		EXPANDED_TITLE_FONT_SIZE -
		scrollProgress * (EXPANDED_TITLE_FONT_SIZE - COLLAPSED_TITLE_FONT_SIZE);
	const titleLineHeight = 1.3 + scrollProgress * 0.1;
	const ghostButtonsAreInteractive = scrollProgress >= 0.5;
	const inertProps = { inert: "" } as unknown as HTMLAttributes<HTMLDivElement>;

	return (
		<div
			className={`absolute inset-x-0 top-0 z-20 overflow-hidden border-b bg-gradient-to-b from-white to-sky-white ${
				scrollProgress === 1 ? "border-sky-shade-20" : "border-transparent"
			}`}
			style={{ height: `${currentHeight}rem` }}
		>
			<div className="absolute right-4 top-3 z-10 h-10 w-[5.375rem]">
				<div
					className="absolute inset-0 flex gap-1.5"
					style={{
						opacity: 1 - scrollProgress,
						pointerEvents: ghostButtonsAreInteractive ? "none" : "auto",
					}}
					aria-hidden={ghostButtonsAreInteractive}
					{...(ghostButtonsAreInteractive ? inertProps : {})}
				>
					<SecondaryIconButton
						iconSrc="/icons/download.svg"
						ariaLabel={downloadAriaLabel}
						className="bg-sky-shade-20 active:bg-sky-shade-20 md:hover:bg-sky-shade-20"
					/>
					<SecondaryIconButton
						iconSrc="/icons/share.svg"
						ariaLabel={shareAriaLabel}
						className="bg-sky-shade-20 active:bg-sky-shade-20 md:hover:bg-sky-shade-20"
					/>
				</div>
				<div
					className="absolute inset-0 flex gap-1.5"
					style={{
						opacity: scrollProgress,
						pointerEvents: ghostButtonsAreInteractive ? "auto" : "none",
					}}
					aria-hidden={!ghostButtonsAreInteractive}
					{...(!ghostButtonsAreInteractive ? inertProps : {})}
				>
					<GhostIconButton
						iconSrc="/icons/download.svg"
						iconSize="h-5 w-5"
						ariaLabel={downloadAriaLabel}
					/>
					<GhostIconButton
						iconSrc="/icons/share.svg"
						iconSize="h-5 w-5"
						ariaLabel={shareAriaLabel}
					/>
				</div>
			</div>

			<h1
				className="absolute left-4 overflow-hidden text-ellipsis whitespace-nowrap text-left font-semibold text-sky-900"
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

			<div className="absolute inset-x-0 top-16">{children}</div>
		</div>
	);
}
