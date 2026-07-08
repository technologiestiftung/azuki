import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { content } from "../../../content";
import { useOccupationDetail } from "./useOccupationDetail";
import { OccupationDetailHero } from "./OccupationDetailHero";
import { OccupationDetailHeaderCollapsed } from "./OccupationDetailHeaderCollapsed";
import { useOccupationDetailScroll } from "./useOccupationDetailScroll";
import { fitPercent } from "../utils/fitPercent";
import {
	resolveOccupationShortDescription,
	resolveOccupationTaskBullets,
} from "@azuki/shared";
import { useAppStore } from "../../../store/useAppStore";
import { useMatchResultsStore } from "../../../store/useMatchResultsStore";
import { useFetchVacancies } from "../useFetchVacancies";
import { OccupationDetailBody } from "./OccupationDetailBody";

export function OccupationDetailPage() {
	const occupationId = Number(useParams().id);
	const detail = useOccupationDetail(occupationId);
	useFetchVacancies();
	const vacancies = useAppStore((state) => state.vacancies);
	const matchResults = useMatchResultsStore((state) => state.matchResults);
	const setVacancyOccupationFilterIds = useMatchResultsStore(
		(state) => state.setVacancyOccupationFilterIds,
	);
	const profile = useAppStore((state) => state.profile);

	const {
		onScroll,
		collapseProgress,
		overlayOpacity,
		heroControlsOpacity,
		heroImageParallaxY,
	} = useOccupationDetailScroll();

	const matchPercent =
		detail.matchedOccupation !== undefined
			? fitPercent(detail.matchedOccupation.score)
			: undefined;

	const taskBullets = detail.occupation
		? resolveOccupationTaskBullets(detail.occupation)
		: [];

	const fallbackShortDescription = detail.occupation
		? resolveOccupationShortDescription(detail.occupation)
		: (detail.matchedOccupation?.shortDescription ?? "");

	let taskItems = taskBullets;
	if (taskItems.length === 0 && fallbackShortDescription) {
		taskItems = [fallbackShortDescription];
	}

	const occupationVacanciesCount = useMemo(() => {
		const occupationName =
			detail.matchedOccupation?.rawName ?? detail.occupation?.name;
		if (!occupationName || !vacancies) {
			return undefined;
		}
		return (
			vacancies.results.find((result) => result.occupation === occupationName)
				?.previews.length ?? 0
		);
	}, [detail.matchedOccupation?.rawName, detail.occupation?.name, vacancies]);

	const nextOccupations = useMemo(() => {
		if (!matchResults) {
			return [];
		}
		const currentIndex = matchResults.occupations.findIndex(
			(occupation) => occupation.id === occupationId,
		);
		if (currentIndex === -1) {
			return [];
		}
		return matchResults.occupations.slice(currentIndex + 1, currentIndex + 4);
	}, [matchResults, occupationId]);

	const statusMessage =
		detail.error ??
		(detail.loading && !detail.occupation
			? content["results.detail.loading"]
			: null);

	return (
		<div className="flex flex-col h-full relative overflow-x-hidden">
			<div
				className="absolute top-0 inset-x-0 z-30 bg-white transition-opacity duration-150"
				style={{
					opacity: collapseProgress,
					pointerEvents: collapseProgress < 0.5 ? "none" : "auto",
				}}
				aria-hidden={collapseProgress < 0.5}
			>
				<OccupationDetailHeaderCollapsed
					displayName={detail.displayName}
					isFavorite={detail.isFavorite}
					onToggleFavorite={detail.toggleFavorite}
				/>
			</div>
			<div
				className="relative flex-1 overflow-y-auto overflow-x-hidden"
				onScroll={onScroll}
			>
				<div className="sticky top-0 z-0">
					<OccupationDetailHero
						displayName={detail.displayName}
						heroImage={detail.heroImage}
						isFavorite={detail.isFavorite}
						onToggleFavorite={detail.toggleFavorite}
						overlayOpacity={overlayOpacity}
						controlsOpacity={heroControlsOpacity}
						imageParallaxY={heroImageParallaxY}
					/>
				</div>
				<div className="relative -mt-4 flex flex-col gap-8 bg-sky-white rounded-t-[20px] pb-8 z-10">
					<h1 className="text-3xl font-semibold text-sky-900 px-[18px] pt-4 ">
						{detail.displayName}
					</h1>
					{statusMessage ? (
						<p className="px-[18px] text-lg text-sky-900">{statusMessage}</p>
					) : (
						<OccupationDetailBody
							occupation={detail.occupation}
							matchedOccupation={detail.matchedOccupation}
							matchPercent={matchPercent}
							taskItems={taskItems}
							profile={profile}
							occupationVacanciesCount={occupationVacanciesCount}
							nextOccupations={nextOccupations}
							onApplyClick={() => {
								if (Number.isFinite(occupationId)) {
									setVacancyOccupationFilterIds([occupationId]);
								}
							}}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
