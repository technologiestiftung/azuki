import { useCallback, useState, type ReactNode, type UIEvent } from "react";
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

export function useResultsPageScrollProgress() {
	const [scrollProgress, setScrollProgress] = useState(0);

	const handleListScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
		const { scrollTop } = event.currentTarget;
		const rootFontSize = Number.parseFloat(
			getComputedStyle(document.documentElement).fontSize,
		);
		const collapseDistance = HEADER_COLLAPSE_DISTANCE * rootFontSize;
		setScrollProgress(Math.min(1, scrollTop / collapseDistance));
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
	const ActionButton =
		scrollProgress < 0.5 ? SecondaryIconButton : GhostIconButton;
	const actionButtonProps =
		scrollProgress < 0.5
			? {
					className:
						"bg-sky-shade-20 active:bg-sky-shade-20 md:hover:bg-sky-shade-20",
				}
			: { iconSize: "h-5 w-5" };

	return (
		<div
			className={`absolute inset-x-0 top-0 z-20 overflow-hidden border-b bg-gradient-to-b from-white to-sky-white ${
				scrollProgress === 1 ? "border-sky-shade-20" : "border-transparent"
			}`}
			style={{ height: `${currentHeight}rem` }}
		>
			<div className="absolute right-4 top-3 z-10 flex gap-1.5">
				<ActionButton
					iconSrc="/icons/download.svg"
					ariaLabel={downloadAriaLabel}
					{...actionButtonProps}
				/>
				<ActionButton
					iconSrc="/icons/share.svg"
					ariaLabel={shareAriaLabel}
					{...actionButtonProps}
				/>
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
