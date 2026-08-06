import {
	useCallback,
	useEffect,
	useState,
	type ReactNode,
	type UIEvent,
} from "react";
import { ResultsPageHeaderCollapsed } from "./ResultsPageHeaderCollapsed";
import { SecondaryIconButton } from "../primitives/buttons/SecondaryIconButton";
import { useTitleMorph } from "../../hooks/useTitleMorph";
import { MorphingTitle } from "../morphing-title/MorphingTitle";

export const COLLAPSED_HEADER_SCROLL_THRESHOLD = 120;

const EXPANDED_HEADER_HEIGHT = 120;
const COLLAPSED_HEADER_HEIGHT = 60;

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
	onDownload: () => void;
	onShare: () => void;
	downloadDisabled?: boolean;
	shareDisabled?: boolean;
}

export function ResultsPageHeader({
	scrollProgress,
	title,
	shareAriaLabel,
	downloadAriaLabel,
	onDownload,
	onShare,
	downloadDisabled = false,
	shareDisabled = false,
}: ResultsPageHeaderProps) {
	const expandedHeight =
		EXPANDED_HEADER_HEIGHT -
		scrollProgress * (EXPANDED_HEADER_HEIGHT - COLLAPSED_HEADER_HEIGHT);

	const {
		heroTitleSlotRef,
		collapsedTitleSlotRef,
		isMorphing,
		titleStyle,
		syncMorphTitle,
	} = useTitleMorph({
		heroFontSizePx: 30,
		collapsedFontSizePx: 16,
		heroLineHeightPx: 36,
		collapsedLineHeightPx: 24,
	});

	useEffect(() => {
		syncMorphTitle(scrollProgress);
	}, [scrollProgress, syncMorphTitle]);

	return (
		<div className="relative shrink-0">
			<div
				className="absolute top-0 inset-x-0 z-10 bg-white"
				style={{
					opacity: scrollProgress,
					pointerEvents: scrollProgress < 0.5 ? "none" : "auto",
				}}
				aria-hidden={scrollProgress < 0.5}
			>
				<ResultsPageHeaderCollapsed
					title={title}
					titleSlotRef={collapsedTitleSlotRef}
					shareAriaLabel={shareAriaLabel}
					downloadAriaLabel={downloadAriaLabel}
					onDownload={onDownload}
					onShare={onShare}
					downloadDisabled={downloadDisabled}
					shareDisabled={shareDisabled}
				/>
			</div>
			<MorphingTitle
				isMorphing={isMorphing}
				style={titleStyle}
				className="text-sky-900"
			>
				{title}
			</MorphingTitle>
			<div
				className="overflow-hidden"
				style={{
					height: `${expandedHeight}px`,
					pointerEvents: scrollProgress >= 0.5 ? "none" : "auto",
				}}
				aria-hidden={scrollProgress >= 0.5}
			>
				<div
					className="flex gap-2 px-4 pt-3 justify-end transition-opacity"
					style={{
						opacity: 1 - scrollProgress,
						pointerEvents: scrollProgress >= 0.5 ? "none" : "auto",
					}}
				>
					<div className="flex gap-1.5 items-center">
						<SecondaryIconButton
							iconSrc="/icons/download.svg"
							ariaLabel={downloadAriaLabel}
							onClick={onDownload}
							disabled={downloadDisabled}
						/>
						<SecondaryIconButton
							iconSrc="/icons/share.svg"
							ariaLabel={shareAriaLabel}
							onClick={onShare}
							disabled={shareDisabled}
						/>
					</div>
				</div>
				<div ref={heroTitleSlotRef} className="w-full">
					<h1
						className={`text-3xl font-semibold text-left py-2 px-[18px] ${
							isMorphing ? "invisible" : "text-sky-900"
						}`}
						aria-hidden={isMorphing}
					>
						{title}
					</h1>
				</div>
			</div>
		</div>
	);
}
