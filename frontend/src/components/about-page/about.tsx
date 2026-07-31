import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type CSSProperties,
	type UIEventHandler,
} from "react";
import { Footer } from "../footer/Footer";
import { content } from "../../content";
import { BottomNav } from "../bottom-nav/BottomNav";
import { SecondaryIconButton } from "../primitives/buttons/SecondaryIconButton";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../routing/routes";
import {
	COLLAPSE_END,
	COLLAPSE_START,
	useOccupationDetailScroll,
} from "../results-page/occupation-detail/useOccupationDetailScroll";
import { AboutHeaderCollapsed } from "./AboutHeaderCollapsed";

const SCROLL_OUT_THRESHOLD_PX = 8;
const TITLE_TOP_OFFSET_PX = 8;
const HERO_TITLE_SIZE_PX = 30;
const COLLAPSED_TITLE_SIZE_PX = 14;
const HERO_LINE_HEIGHT_PX = 36;
const COLLAPSED_LINE_HEIGHT_PX = 20;

type TitleRect = {
	left: number;
	top: number;
	width: number;
};

function titleMorphProgressFromScrollY(scrollY: number): number {
	return Math.min(
		1,
		Math.max(0, (scrollY - COLLAPSE_START) / (COLLAPSE_END - COLLAPSE_START)),
	);
}

export const AboutPage = () => {
	const navigate = useNavigate();
	const { collapseProgress, heroControlsOpacity, onScroll } =
		useOccupationDetailScroll();
	const [isScrolledAway, setIsScrolledAway] = useState(false);

	const heroTitleSlotRef = useRef<HTMLDivElement>(null);
	const collapsedTitleSlotRef = useRef<HTMLDivElement>(null);
	const scrollYRef = useRef(0);
	const morphOriginRef = useRef<TitleRect | null>(null);
	const [isMorphing, setIsMorphing] = useState(false);
	const [titleStyle, setTitleStyle] = useState<CSSProperties | undefined>();

	const syncMorphTitle = useCallback((scrollY: number) => {
		const fromEl = heroTitleSlotRef.current;
		const toEl = collapsedTitleSlotRef.current;
		if (!fromEl || !toEl) {
			return;
		}

		const progress = titleMorphProgressFromScrollY(scrollY);

		if (progress <= 0) {
			morphOriginRef.current = null;
			setIsMorphing(false);
			setTitleStyle(undefined);
			return;
		}

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
			top: Math.max(TITLE_TOP_OFFSET_PX, morphTop),
			width: from.width + (to.width - from.width) * progress,
			fontSize:
				HERO_TITLE_SIZE_PX +
				(COLLAPSED_TITLE_SIZE_PX - HERO_TITLE_SIZE_PX) * progress,
			lineHeight: `${
				HERO_LINE_HEIGHT_PX +
				(COLLAPSED_LINE_HEIGHT_PX - HERO_LINE_HEIGHT_PX) * progress
			}px`,
			zIndex: 40,
			pointerEvents: "none",
			margin: 0,
		});
	}, []);

	const handleScroll: UIEventHandler<HTMLDivElement> = useCallback(
		(event) => {
			onScroll(event);
			const scrollY = event.currentTarget.scrollTop;
			scrollYRef.current = scrollY;
			setIsScrolledAway(scrollY > SCROLL_OUT_THRESHOLD_PX);
			syncMorphTitle(scrollY);
		},
		[onScroll, syncMorphTitle],
	);

	useEffect(() => {
		const onResize = () => {
			morphOriginRef.current = null;
			syncMorphTitle(scrollYRef.current);
		};
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, [syncMorphTitle]);

	return (
		<div className="flex flex-col h-full relative overflow-x-hidden pb-16">
			<AboutHeaderCollapsed
				collapseProgress={collapseProgress}
				titleSlotRef={collapsedTitleSlotRef}
			/>
			{isMorphing && (
				<h1
					className="font-semibold text-left truncate will-change-[left,top,width,font-size]"
					style={titleStyle}
				>
					{content["about.title"]}
				</h1>
			)}
			<div
				className="relative flex-1 overflow-y-auto overflow-x-hidden"
				onScroll={handleScroll}
			>
				<div className="sticky top-0 z-[1] flex flex-col px-4 pt-2 pb-2">
					<div className="flex items-center h-10 transition-opacity duration-150">
						<SecondaryIconButton
							iconSrc="/icons/arrow-back-black.svg"
							ariaLabel={content["about.backButton.ariaLabel"]}
							onClick={() => navigate(ROUTE_PATHS.profile)}
							className="transition-[background-color] duration-150"
							style={{
								backgroundColor: `rgba(209, 213, 219, ${heroControlsOpacity})`,
							}}
						/>
					</div>
					<div ref={heroTitleSlotRef} className="w-fit">
						<h1
							className={`text-3xl font-semibold py-2 ${
								isMorphing ? "invisible" : ""
							}`}
							aria-hidden={isMorphing}
						>
							{content["about.title"]}
						</h1>
					</div>
					<div
						className={`absolute top-0 right-0 pt-2 [animation-duration:0.4s] ${
							isScrolledAway ? "animate-slideOutRight" : "animate-slideInRight"
						}`}
					>
						<img src="/illustrations/azuki-star-peeking.svg" alt="" />
					</div>
				</div>
				<p className="text-lg px-[18px] py-2">
					{content["about.description.p1"]}
				</p>
				<p
					className="text-lg px-[18px] py-2 [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-sky-200"
					dangerouslySetInnerHTML={{
						__html: content["about.description.p2"],
					}}
				/>
				<div className="flex flex-col gap-8 px-[18px] pt-8 pb-16">
					<div className="flex flex-col gap-4 items-start">
						<span className="text-sm font-medium text-sky-shade-170">
							{content["about.logobanner.projectOf"]}
						</span>
						<img
							src="/logos/technologie-stiftung-logo.svg"
							alt=""
							className="h-12"
						/>
					</div>
					<div className="flex flex-col gap-4 items-start">
						<span className="text-sm font-medium text-sky-shade-170">
							{content["about.logobanner.developedBy"]}
						</span>
						<div className="flex gap-8 justify-between">
							<img
								src={content["about.logobanner.cityLabBerlin.logoLink"]}
								alt=""
								className="h-12"
							/>
							<div className="flex items-center justify-center h-12">
								<img src="/logos/joblinge-logo.svg" alt="" />
							</div>
						</div>
					</div>
					<div className="flex flex-col gap-4 items-start">
						<span className="text-sm font-medium text-sky-shade-170">
							{content["about.logobanner.sponsoredBy"]}
						</span>
						<img src="/logos/bmas-logo.svg" alt="" className="h-[38px]" />
					</div>
				</div>
				<Footer />
			</div>
			<BottomNav />
		</div>
	);
};
