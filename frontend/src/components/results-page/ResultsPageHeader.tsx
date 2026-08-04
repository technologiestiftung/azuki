import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type CSSProperties,
	type ReactNode,
	type UIEvent,
} from "react";
import { ResultsPageHeaderCollapsed } from "./ResultsPageHeaderCollapsed";
import { SecondaryIconButton } from "../primitives/buttons/SecondaryIconButton";

export const COLLAPSED_HEADER_SCROLL_THRESHOLD = 120;

const EXPANDED_HEADER_HEIGHT = 120;
const COLLAPSED_HEADER_HEIGHT = 60;

const EXPANDED_TITLE_SIZE_PX = 30;
const COLLAPSED_TITLE_SIZE_PX = 16;
const EXPANDED_LINE_HEIGHT_PX = 36;
const COLLAPSED_LINE_HEIGHT_PX = 24;

type TitleRect = {
	left: number;
	top: number;
	width: number;
};

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
	multilineTitle?: boolean;
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
	multilineTitle = false,
}: ResultsPageHeaderProps) {
	const expandedHeaderHeight = multilineTitle
		? EXPANDED_HEADER_HEIGHT + EXPANDED_LINE_HEIGHT_PX
		: EXPANDED_HEADER_HEIGHT;
	const expandedHeight =
		expandedHeaderHeight -
		scrollProgress * (expandedHeaderHeight - COLLAPSED_HEADER_HEIGHT);

	const heroTitleSlotRef = useRef<HTMLDivElement>(null);
	const collapsedTitleSlotRef = useRef<HTMLDivElement>(null);
	const morphOriginRef = useRef<TitleRect | null>(null);
	const scrollProgressRef = useRef(scrollProgress);
	const [isMorphing, setIsMorphing] = useState(false);
	const [titleStyle, setTitleStyle] = useState<CSSProperties | undefined>();

	scrollProgressRef.current = scrollProgress;

	const syncMorphTitle = useCallback((progress: number) => {
		const fromEl = heroTitleSlotRef.current;
		const toEl = collapsedTitleSlotRef.current;
		if (!fromEl || !toEl) {
			return;
		}

		// Below threshold: title stays in expanded header flow — no fixed morph.
		if (progress <= 0) {
			morphOriginRef.current = null;
			setIsMorphing(false);
			setTitleStyle(undefined);
			return;
		}

		// Freeze start position when morph begins so the title peels off
		// from where it was in the expanded header, then travels to the collapsed slot.
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

		setIsMorphing(true);
		setTitleStyle({
			position: "fixed",
			left: from.left + (to.left - from.left) * progress,
			top: from.top + (to.top - from.top) * progress,
			width: from.width + (to.width - from.width) * progress,
			fontSize:
				EXPANDED_TITLE_SIZE_PX +
				(COLLAPSED_TITLE_SIZE_PX - EXPANDED_TITLE_SIZE_PX) * progress,
			lineHeight: `${
				EXPANDED_LINE_HEIGHT_PX +
				(COLLAPSED_LINE_HEIGHT_PX - EXPANDED_LINE_HEIGHT_PX) * progress
			}px`,
			zIndex: 40,
			pointerEvents: "none",
			margin: 0,
		});
	}, []);

	useEffect(() => {
		syncMorphTitle(scrollProgress);
	}, [scrollProgress, syncMorphTitle]);

	useEffect(() => {
		const onResize = () => {
			morphOriginRef.current = null;
			syncMorphTitle(scrollProgressRef.current);
		};
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, [syncMorphTitle]);

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
			{isMorphing && (
				<h1
					className="font-semibold text-sky-900 text-left truncate will-change-[left,top,width,font-size]"
					style={titleStyle}
				>
					{title}
				</h1>
			)}
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
