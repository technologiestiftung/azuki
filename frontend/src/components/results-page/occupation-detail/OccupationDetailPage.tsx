import { useState } from "react";
import { useParams } from "react-router-dom";
import { content } from "../../../content";
import { OccupationDetailMetaInfo } from "./OccupationDetailMetaInfo";
import { useOccupationDetail } from "./useOccupationDetail";
import { OccupationDetailHero } from "./OccupationDetailHero";
import { OccupationDetailHeaderCollapsed } from "./OccupationDetailHeaderCollapsed";
import { useOccupationDetailScroll } from "./useOccupationDetailScroll";
import { fitPercent } from "../utils/fitPercent";
import { InfoBottomSheet } from "./InfoBottomSheet";

type InfoSheet = "matchInfo";

export function OccupationDetailPage() {
	const occupationId = Number(useParams().id);
	const detail = useOccupationDetail(occupationId);
	const { onScroll, collapseProgress, overlayOpacity, heroControlsOpacity } =
		useOccupationDetailScroll();
	const [activeInfoSheet, setActiveInfoSheet] = useState<InfoSheet | null>(
		null,
	);
	const handleMatchInfoClick = () => {
		setActiveInfoSheet("matchInfo");
	};

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
							{/* TODO: task list */}
							<li>{detail.occupation?.shortDescription}</li>
						</ul>
					</div>
					<div className="flex flex-col px-4 gap-0.5">
						<div className="px-[18px] pt-3 pb-4 flex flex-col gap-6 rounded-t-[20px] bg-sky-50">
							<div className="flex flex-col gap-0.5">
								<h2 className="text-sky-900 text-2xl font-semibold">
									{content["results.detail.tasks.matchTitle"]}
								</h2>
								<button
									type="button"
									aria-label={
										content["results.detail.tasks.matchInfo.ariaLabel"]
									}
									onClick={handleMatchInfoClick}
									className="h-10 flex gap-1 items-center justify-start text-sky-140 text-base font-medium underline underline-offset-2 text-start"
								>
									{content["results.detail.tasks.matchInfo.title"]}
									<img src="/icons/info.svg" alt="" className="w-5 h-5" />
								</button>
							</div>
							{detail.matchedOccupation !== undefined && (
								<div>
									<span className="text-sky-900 text-[85px] font-medium">
										{fitPercent(detail.matchedOccupation.score)} %
									</span>
								</div>
							)}
						</div>
						<div className="flex flex-col gap-0.5 px-4 pt-5 pb-4 bg-sky-10">
							<div className="flex gap-[9px]">
								<div className="flex items-center justify-center w-fit h-[30px] bg-sky-300 rounded-md px-[5px] pt[5px] pb[7px]">
									<img src="/icons/thumb-up.svg" alt="" className="w-4 h-4" />
								</div>
								<h2 className="text-sky-900 text-xl font-semibold self-center">
									{content["results.detail.whyItMatches.title"]}
								</h2>
							</div>
						</div>
						<div className="flex flex-col gap-0.5 px-4 pt-5 pb-4 rounded-b-[20px] bg-sky-10">
							<div className="flex gap-[9px]">
								<div className="flex items-center justify-center w-fit h-[30px] bg-orange-400 rounded-md px-[5px] pt[5px] pb[7px]">
									<img src="/icons/thumb-down.svg" alt="" className="w-4 h-4" />
								</div>
								<h2 className="text-sky-900 text-xl font-semibold self-center">
									{content["results.detail.whyItMatches.notMatchTitle"]}
								</h2>
							</div>
						</div>
					</div>
				</div>
			</div>
			<InfoBottomSheet
				open={activeInfoSheet !== null}
				onClose={() => setActiveInfoSheet(null)}
				title={content["results.detail.tasks.matchInfo.title"]}
				description={content["results.detail.tasks.matchInfo.description"]}
			/>
		</div>
	);
}
