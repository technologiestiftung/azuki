import { useMemo } from "react";
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
	CollapsingHeaderTopRow,
	expandedButtonBackgroundStyle,
} from "../components/collapsing-header/CollapsingHeaderTopRow";
import { ProfileActionButtons } from "./ProfileActionButtons";

export function Profile() {
	const { collapseProgress, heroControlsOpacity, onScroll } =
		useOccupationDetailScroll();
	const matchResults = useMatchResultsStore((state) => state.matchResults);
	const ownProfile = useAppStore((state) => state.profile);
	const { isSharedView, sharedProfile, sharedOccupations, isLoadingShared } =
		useSharedProfile();
	const profile = sharedProfile ?? ownProfile;

	const topOccupations = useMemo(() => {
		if (isSharedView) {
			return sharedOccupations.slice(0, 3);
		}
		return [...(matchResults?.occupations ?? [])]
			.sort((a, b) => b.score - a.score)
			.slice(0, 3);
	}, [isSharedView, sharedOccupations, matchResults]);

	return (
		<div
			className={`flex flex-col h-full relative overflow-x-hidden bg-sky-100 ${
				isSharedView ? "" : "pb-16"
			}`}
		>
			<div
				className="relative flex-1 overflow-y-auto overflow-x-hidden"
				onScroll={onScroll}
			>
				<CollapsingHeaderTopRow
					title={content["profile.title"]}
					progress={collapseProgress}
					collapsedFill
					gradientFrom="sky-100"
					trailing={
						!isSharedView ? (
							<ProfileActionButtons
								buttonClassName="transition-[background-color] duration-150"
								buttonStyle={expandedButtonBackgroundStyle(collapseProgress)}
							/>
						) : undefined
					}
				/>
				<ProfileHero
					heroControlsOpacity={heroControlsOpacity}
					titleOpacity={1 - collapseProgress}
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
