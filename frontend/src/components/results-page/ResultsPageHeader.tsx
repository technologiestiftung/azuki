import { useCallback, useState, type ReactNode, type UIEvent } from "react";
import {
	CollapsingHeaderTopRow,
	expandedButtonBackgroundStyle,
} from "../collapsing-header/CollapsingHeaderTopRow";
import { SecondaryIconButton } from "../primitives/buttons/SecondaryIconButton";

export const COLLAPSED_HEADER_SCROLL_THRESHOLD = 120;

/** Approximate height of the top-row overlay (pt-3 + 40px button + pb-2). */
export const TOP_ROW_HEIGHT_PX = 60;

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
	titleRevealProgress: number;
	title: ReactNode;
	shareAriaLabel: string;
	downloadAriaLabel: string;
	onDownload: () => void;
	onShare: () => void;
	downloadDisabled?: boolean;
	shareDisabled?: boolean;
}

export function ResultsPageHeader({
	scrollProgress,
	titleRevealProgress,
	title,
	shareAriaLabel,
	downloadAriaLabel,
	onDownload,
	onShare,
	downloadDisabled = false,
	shareDisabled = false,
}: ResultsPageHeaderProps) {
	return (
		<CollapsingHeaderTopRow
			title={title}
			progress={scrollProgress}
			titleRevealProgress={titleRevealProgress}
			collapsedBorder={false}
			trailing={
				<>
					<SecondaryIconButton
						iconSrc="/icons/download.svg"
						ariaLabel={downloadAriaLabel}
						onClick={onDownload}
						disabled={downloadDisabled}
						className="transition-[background-color] duration-150"
						style={expandedButtonBackgroundStyle(scrollProgress)}
					/>
					<SecondaryIconButton
						iconSrc="/icons/share.svg"
						ariaLabel={shareAriaLabel}
						onClick={onShare}
						disabled={shareDisabled}
						className="transition-[background-color] duration-150"
						style={expandedButtonBackgroundStyle(scrollProgress)}
					/>
				</>
			}
		/>
	);
}
