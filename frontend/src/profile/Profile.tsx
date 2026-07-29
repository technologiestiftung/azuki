import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type CSSProperties,
	type UIEventHandler,
} from "react";
import {
	COLLAPSE_END,
	COLLAPSE_START,
	useOccupationDetailScroll,
} from "../components/results-page/occupation-detail/useOccupationDetailScroll";
import { content } from "../content";
import { useMatchResultsStore } from "../store/useMatchResultsStore";
import { useAppStore } from "../store/useAppStore";
import { ProfileHeaderCollapsed } from "./ProfileHeaderCollapsed";
import { ProfileHero } from "./ProfileHero";
import { TopOccupationsCarousel } from "./TopOccupationsCarousel";
import { ProfileAboutSection } from "./ProfileAboutSection";
import { ContactCard } from "../components/results-page/ContactCard";
import { ProfileResetCard } from "./ProfileResetCard";

const HERO_TITLE_SIZE_PX = 32;
const COLLAPSED_TITLE_SIZE_PX = 14;
const HERO_LINE_HEIGHT_PX = 42;
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

export function Profile() {
	const { collapseProgress, heroControlsOpacity, onScroll } =
		useOccupationDetailScroll();
	const matchResults = useMatchResultsStore((state) => state.matchResults);
	const profile = useAppStore((state) => state.profile);

	const heroTitleSlotRef = useRef<HTMLDivElement>(null);
	const collapsedTitleSlotRef = useRef<HTMLDivElement>(null);
	const scrollYRef = useRef(0);
	const morphOriginRef = useRef<TitleRect | null>(null);
	const [isMorphing, setIsMorphing] = useState(false);
	const [titleStyle, setTitleStyle] = useState<CSSProperties | undefined>();

	const topOccupations = useMemo(
		() =>
			[...(matchResults?.occupations ?? [])]
				.sort((a, b) => b.score - a.score)
				.slice(0, 3),
		[matchResults],
	);

	const syncMorphTitle = useCallback((scrollY: number) => {
		const fromEl = heroTitleSlotRef.current;
		const toEl = collapsedTitleSlotRef.current;
		if (!fromEl || !toEl) {
			return;
		}

		const progress = titleMorphProgressFromScrollY(scrollY);

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

		setIsMorphing(true);
		setTitleStyle({
			position: "fixed",
			left: from.left + (to.left - from.left) * progress,
			top: from.top + (to.top - from.top) * progress,
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

	const footerLinks = [
		{
			label: content["profile.footerLinks.about"],
			href: "/about",
			external: false,
		},
		{
			label: content["profile.footerLinks.feedback"],
			href: content["profile.footerLinks.feedback.link"],
			external: true,
		},
		{
			label: content["profile.footerLinks.imprint"],
			href: content["profile.footerLinks.imprint.link"],
			external: true,
		},
		{
			label: content["profile.footerLinks.privacyPolicy"],
			href: content["profile.footerLinks.privacyPolicy.link"],
			external: true,
		},
	];

	return (
		<div className="flex flex-col h-full relative overflow-x-hidden bg-sky-100">
			<ProfileHeaderCollapsed
				collapseProgress={collapseProgress}
				titleSlotRef={collapsedTitleSlotRef}
			/>
			{isMorphing && (
				<h1
					className="font-semibold text-sky-900 text-left truncate will-change-[left,top,width,font-size]"
					style={titleStyle}
				>
					{content["profile.title"]}
				</h1>
			)}
			<div
				className="relative flex-1 overflow-y-auto overflow-x-hidden"
				onScroll={handleScroll}
			>
				<ProfileHero
					heroControlsOpacity={heroControlsOpacity}
					titleSlotRef={heroTitleSlotRef}
					showTitle={!isMorphing}
				/>
				{topOccupations.length > 0 && (
					<TopOccupationsCarousel occupations={topOccupations} />
				)}
				<ProfileAboutSection profile={profile} />
				<div className="flex flex-col gap-[28px] px-4 bg-white">
					<ContactCard />
					<ProfileResetCard />
					<div className="flex flex-col gap-4 pt-6 px-8 pb-8 rounded-t-4xl bg-sky-100">
						{footerLinks.map((link) => (
							<a
								key={link.label}
								href={link.href}
								target={link.external ? "_blank" : undefined}
								rel={link.external ? "noopener noreferrer" : undefined}
								className="flex gap-2 text-lg font-medium text-sky-900 disabled:text-gray-400 active:text-sky-800 disabled:text-sky-shade-70"
							>
								{link.label}
								{link.external && (
									<img
										src="/icons/open-in-new-dark.svg"
										alt=""
										width={20}
										height={20}
									/>
								)}
							</a>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
