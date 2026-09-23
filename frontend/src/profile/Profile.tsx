import { useEffect, useMemo, type UIEvent } from "react";
import { useOccupationDetailScroll } from "../components/results-page/occupation-detail/useOccupationDetailScroll";
import { content } from "../content";
import { useMatchResultsStore } from "../store/useMatchResultsStore";
import { useAppStore } from "../store/useAppStore";
import { useProfileStore } from "../store/useProfileStore";
import { ProfileHero } from "./ProfileHero";
import { TopOccupationsCarousel } from "./TopOccupationsCarousel";
import { ProfileAboutSection } from "./ProfileAboutSection";
import { ContactCard } from "../components/contact-card/ContactCard";
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
import { warmPdfRuntime } from "../components/pdf/loadPdfAssets";

export function Profile() {
	const { collapseProgress, heroControlsOpacity, onScroll } =
		useOccupationDetailScroll();
	const matchResults = useMatchResultsStore((state) => state.matchResults);
	const ownProfile = useAppStore((state) => state.profile);
	const profileName = useProfileStore((state) => state.profileName);
	const { isSharedView, sharedProfile, sharedOccupations, isLoadingShared } =
		useSharedProfile();
	const profile = sharedProfile ?? ownProfile;
	const { titleRef, titleRevealProgress, updateTitleReveal } =
		useCollapsedTitleReveal();
	const handleScroll = (event: UIEvent<HTMLDivElement>) => {
		onScroll(event);
		updateTitleReveal(event.currentTarget);
	};

	const topOccupations = useMemo(() => {
		if (isSharedView) {
			return sharedOccupations.slice(0, 3);
		}
		return (matchResults?.occupations ?? []).slice(0, 3);
	}, [isSharedView, sharedOccupations, matchResults]);
	const collapsed = collapseProgress > COLLAPSED_THRESHOLD;

	useEffect(() => {
		const warm = () => {
			void warmPdfRuntime();
			void import("./exportProfilePdf");
		};
		if (typeof window.requestIdleCallback === "function") {
			const idleId = window.requestIdleCallback(warm, { timeout: 2500 });
			return () => window.cancelIdleCallback(idleId);
		}
		const timeoutId = window.setTimeout(warm, 400);
		return () => window.clearTimeout(timeoutId);
	}, []);

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
					title={isSharedView ? content["profile.title"] : profileName}
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
									<ProfileActionButtons
										buttonClassName="bg-sky-shade-10/50 rounded-xl backdrop-blur-[4.5px]"
										tabIndex={collapsed ? -1 : undefined}
									/>
								</div>
								<div
									className="[grid-area:1/1] transition-opacity duration-150"
									style={{
										opacity: collapseProgress,
										pointerEvents: collapsed ? "auto" : "none",
									}}
									aria-hidden={!collapsed}
								>
									<ProfileActionButtons tabIndex={collapsed ? undefined : -1} />
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
					<ContactCard
						title={content["profile.contactCard.title"]}
						description={content["profile.contactCard.description"]}
					/>
					{!isSharedView && <ProfileResetCard />}
				</div>
				<Footer />
			</div>
			{!isSharedView && <BottomNav />}
		</div>
	);
}
