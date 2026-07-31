import { useCallback, useMemo, type UIEventHandler } from "react";
import {
	collapseProgressFromScrollY,
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
import { BottomNav } from "../components/bottom-nav/BottomNav";
import { Footer } from "../components/footer/Footer";
import { useSharedProfile } from "./useSharedProfile";
import { useTitleMorph } from "../hooks/useTitleMorph";
import { MorphingTitle } from "../components/morphing-title/MorphingTitle";

export function Profile() {
	const { collapseProgress, heroControlsOpacity, onScroll } =
		useOccupationDetailScroll();
	const matchResults = useMatchResultsStore((state) => state.matchResults);
	const ownProfile = useAppStore((state) => state.profile);
	const { isSharedView, sharedProfile, sharedOccupations, isLoadingShared } =
		useSharedProfile();
	const profile = sharedProfile ?? ownProfile;

	const {
		heroTitleSlotRef,
		collapsedTitleSlotRef,
		isMorphing,
		titleStyle,
		syncMorphTitle,
	} = useTitleMorph({
		heroFontSizePx: 32,
		collapsedFontSizePx: 14,
		heroLineHeightPx: 42,
		collapsedLineHeightPx: 20,
	});

	const topOccupations = useMemo(() => {
		if (isSharedView) {
			return sharedOccupations.slice(0, 3);
		}
		return [...(matchResults?.occupations ?? [])]
			.sort((a, b) => b.score - a.score)
			.slice(0, 3);
	}, [isSharedView, sharedOccupations, matchResults]);

	const handleScroll: UIEventHandler<HTMLDivElement> = useCallback(
		(event) => {
			onScroll(event);
			syncMorphTitle(
				collapseProgressFromScrollY(event.currentTarget.scrollTop),
			);
		},
		[onScroll, syncMorphTitle],
	);

	return (
		<div
			className={`flex flex-col h-full relative overflow-x-hidden bg-sky-100 ${
				isSharedView ? "" : "pb-16"
			}`}
		>
			<ProfileHeaderCollapsed
				collapseProgress={collapseProgress}
				titleSlotRef={collapsedTitleSlotRef}
				isSharedView={isSharedView}
			/>
			<MorphingTitle
				isMorphing={isMorphing}
				style={titleStyle}
				className="text-sky-900"
			>
				{content["profile.title"]}
			</MorphingTitle>
			<div
				className="relative flex-1 overflow-y-auto overflow-x-hidden"
				onScroll={handleScroll}
			>
				<ProfileHero
					heroControlsOpacity={heroControlsOpacity}
					titleSlotRef={heroTitleSlotRef}
					showTitle={!isMorphing}
					isSharedView={isSharedView}
				/>
				{!isLoadingShared && topOccupations.length > 0 && (
					<TopOccupationsCarousel occupations={topOccupations} />
				)}
				<ProfileAboutSection profile={profile} />
				<div className="flex flex-col gap-[28px] px-4 bg-white pb-[28px]">
					<ContactCard />
					{!isSharedView && <ProfileResetCard />}
				</div>
				<Footer />
			</div>
			{!isSharedView && <BottomNav />}
		</div>
	);
}
