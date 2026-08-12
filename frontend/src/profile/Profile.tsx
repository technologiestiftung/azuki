import { useCallback, useMemo, type UIEventHandler } from "react";
import { useOccupationDetailScroll } from "../components/results-page/occupation-detail/useOccupationDetailScroll";
import { content } from "../content";
import { useMatchResultsStore } from "../store/useMatchResultsStore";
import { useAppStore } from "../store/useAppStore";
import { ProfileHero } from "./ProfileHero";
import { TopOccupationsCarousel } from "./TopOccupationsCarousel";
import { ProfileAboutSection } from "./ProfileAboutSection";
import { ContactCard } from "../components/results-page/ContactCard";
import { ProfileResetCard } from "./ProfileResetCard";
import { BottomNav } from "../components/bottom-nav/BottomNav";
import { Footer } from "../components/footer/Footer";
import { useSharedProfile } from "./useSharedProfile";
import {
	COLLAPSED_THRESHOLD,
	CollapsingHeaderTopRow,
} from "../components/collapsing-header/CollapsingHeaderTopRow";
import { ProfileActionButtons } from "./ProfileActionButtons";
import { useCollapsedTitleReveal } from "../components/collapsing-header/useCollapsedTitleReveal";

export function Profile() {
	const { collapseProgress, heroControlsOpacity, onScroll } =
		useOccupationDetailScroll();
	const matchResults = useMatchResultsStore((state) => state.matchResults);
	const ownProfile = useAppStore((state) => state.profile);
	const { isSharedView, sharedProfile, sharedOccupations, isLoadingShared } =
		useSharedProfile();
	const profile = sharedProfile ?? ownProfile;
	const { titleRef, titleRevealProgress, updateTitleReveal } =
		useCollapsedTitleReveal();
	const handleScroll: UIEventHandler<HTMLDivElement> = useCallback(
		(event) => {
			onScroll(event);
			updateTitleReveal(event.currentTarget);
		},
		[onScroll, updateTitleReveal],
	);

	const topOccupations = useMemo(() => {
		if (isSharedView) {
			return sharedOccupations.slice(0, 3);
		}
		return [...(matchResults?.occupations ?? [])]
			.sort((a, b) => b.score - a.score)
			.slice(0, 3);
	}, [isSharedView, sharedOccupations, matchResults]);
	const collapsed = collapseProgress > COLLAPSED_THRESHOLD;

	return (
		<div
			className={`flex flex-col h-full relative overflow-x-hidden bg-sky-100 ${
				isSharedView ? "" : "pb-16"
			}`}
		>
			<div
				className="relative flex-1 overflow-y-auto overflow-x-hidden"
				onScroll={handleScroll}
			>
				<CollapsingHeaderTopRow
					title={content["profile.title"]}
					progress={collapseProgress}
					titleRevealProgress={titleRevealProgress}
					collapsedFill
					gradientFrom="sky-100"
					trailing={
						!isSharedView ? (
							<div className="grid">
								{/* Frosted over the blue hero, cross-fading with the plain
								    set once the header fill turns solid. */}
								<div
									className="[grid-area:1/1] transition-opacity duration-150"
									style={{
										opacity: 1 - collapseProgress,
										pointerEvents: collapsed ? "none" : "auto",
									}}
									aria-hidden={collapsed}
								>
									<ProfileActionButtons buttonClassName="bg-sky-shade-10/50 rounded-xl backdrop-blur-[4.5px]" />
								</div>
								<div
									className="[grid-area:1/1] transition-opacity duration-150"
									style={{
										opacity: collapseProgress,
										pointerEvents: collapsed ? "auto" : "none",
									}}
									aria-hidden={!collapsed}
								>
									<ProfileActionButtons />
								</div>
							</div>
						) : undefined
					}
				/>
				<ProfileHero
					heroControlsOpacity={heroControlsOpacity}
					titleOpacity={1 - collapseProgress}
					titleRef={titleRef}
					isSharedView={isSharedView}
					profile={profile}
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
