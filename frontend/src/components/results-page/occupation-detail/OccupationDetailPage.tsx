import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../routing/routes";
import { content } from "../../../content";
import { OccupationDetailMetaInfo } from "./OccupationDetailMetaInfo";
import { useOccupationDetail } from "./useOccupationDetail";
import { OccupationDetailHero } from "./OccupationDetailHero";
import { OccupationDetailHeaderCollapsed } from "./OccupationDetailHeaderCollapsed";
import { useOccupationDetailScroll } from "./useOccupationDetailScroll";
import { fitPercent } from "../utils/fitPercent";
import {
	resolveOccupationShortDescription,
	resolveOccupationTaskBullets,
} from "@azuki/shared";
import { OccupationDetailMatchSection } from "./OccupationDetailMatchSection";
import { useAppStore } from "../../../store/useAppStore";
import { useMatchResultsStore } from "../../../store/useMatchResultsStore";
import { useFetchVacancies } from "../useFetchVacancies";

export function OccupationDetailPage() {
	const occupationId = Number(useParams().id);
	const detail = useOccupationDetail(occupationId);
	useFetchVacancies();
	const vacancies = useAppStore((state) => state.vacancies);
	const setVacancyOccupationFilterIds = useMatchResultsStore(
		(state) => state.setVacancyOccupationFilterIds,
	);
	const profile = useAppStore((state) => state.profile);
	const { onScroll, collapseProgress, overlayOpacity, heroControlsOpacity } =
		useOccupationDetailScroll();
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
					/>
				</div>
				<div className="relative -mt-4 flex flex-col gap-8 bg-sky-white rounded-t-[20px] pb-8 z-10">
					<h1 className="text-3xl font-semibold text-sky-900 px-[18px] pt-4 ">
						{detail.displayName}
					</h1>
					<div className="px-4">
						<OccupationDetailMetaInfo occupation={detail.occupation} />
					</div>
					<div className="px-[18px] flex flex-col gap-3">
						<h2 className="text-sky-900 text-2xl font-semibold">
							{content["results.detail.tasksTitle"]}
						</h2>
						<ul className="flex flex-col gap-2 list-disc pl-[18px]">
							{taskItems.map((task) => (
								<li
									key={task}
									className="text-sky-900 text-lg leading-6 font-normal"
								>
									{task}
								</li>
							))}
						</ul>
					</div>
					<OccupationDetailMatchSection
						matchPercent={matchPercent}
						occupation={detail.occupation}
						profile={profile}
					/>
					<div className="px-4">
						<div className="flex flex-col gap-5 px-4 py-5 rounded-2xl bg-sky-50 border border-sky-100">
							<div className="flex flex-col gap-[7px] text-center">
								<h3 className="text-sky-1000 text-2xl font-semibold">
									{content["results.detail.apply.title"]}
								</h3>
								<p className="text-lg font-normal text-sky-1000">
									{content["results.detail.apply.description"]}
								</p>
							</div>
							<Link
								to={ROUTE_PATHS.resultsFreeSpots}
								onClick={() => {
									if (Number.isFinite(occupationId)) {
										setVacancyOccupationFilterIds([occupationId]);
									}
								}}
								aria-label={content["results.detail.apply.cta.ariaLabel"]}
								className="h-12 flex items-center justify-center gap-2 w-full py-2 px-5 rounded-2xl text-base font-medium transition-colors
								focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 active:bg-sky-200 active:text-sky-900
								bg-sky-300 text-sky-1000 md:hover:bg-sky-200 md:hover:text-sky-900"
							>
								{content["results.detail.apply.cta"]}
								{occupationVacanciesCount !== undefined &&
									occupationVacanciesCount > 0 &&
									` (${occupationVacanciesCount})`}
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
