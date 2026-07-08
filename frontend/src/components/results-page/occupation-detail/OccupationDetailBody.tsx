import { Link } from "react-router-dom";
import type { Occupation, UserProfile } from "@azuki/shared";
import {
	ROUTE_PATHS,
	buildResultsOccupationPath,
} from "../../../routing/routes";
import { content } from "../../../content";
import { OccupationDetailMetaInfo } from "./OccupationDetailMetaInfo";
import { OccupationDetailMatchSection } from "./OccupationDetailMatchSection";
import { OccupationImageCarousel } from "./OccupationImageCarousel";
import type { OccupationMatchPillGroups } from "../utils/occupationMatchPills";
import type { SharedNextOccupationCard } from "./useSharedNextOccupations";

interface OccupationDetailBodyProps {
	occupation: Occupation | null;
	matchPercent: number | undefined;
	taskItems: string[];
	profile: UserProfile;
	sharedPills?: OccupationMatchPillGroups;
	occupationDuration: string;
	occupationVacanciesCount: number | undefined;
	nextOccupationCards: SharedNextOccupationCard[];
	onApplyClick: () => void;
}

export function OccupationDetailBody({
	occupation,
	matchPercent,
	taskItems,
	profile,
	sharedPills,
	occupationDuration,
	occupationVacanciesCount,
	nextOccupationCards,
	onApplyClick,
}: OccupationDetailBodyProps) {
	return (
		<>
			<div className="px-4">
				<OccupationDetailMetaInfo
					occupation={occupation}
					occupationDuration={occupationDuration}
				/>
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
				occupation={occupation}
				profile={profile}
				sharedPills={sharedPills}
			/>
			{occupation && occupation.images.length > 0 && (
				<div className="flex flex-col gap-2">
					<h3 className="text-sky-900 text-2xl font-semibold px-[18px]">
						{content["results.detail.images.title"]}
					</h3>
					<OccupationImageCarousel images={occupation.images} />
				</div>
			)}
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
						onClick={onApplyClick}
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
			{nextOccupationCards.length > 0 && (
				<div className="flex flex-col gap-2 pl-4 pt-[25px] pb-4 bg-sky-50">
					<h3 className="text-sky-900 text-2xl font-semibold text-left">
						{content["results.detail.moreOccupations.title"]}
					</h3>
					<div className="flex gap-2 w-full overflow-x-scroll">
						{nextOccupationCards.map((nextOccupation) => (
							<Link
								key={nextOccupation.id}
								to={buildResultsOccupationPath(nextOccupation.id)}
								className="flex flex-col min-w-[300px] gap-3 px-2 pt-2 pb-4 bg-white rounded-[20px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 last:mr-4"
								aria-label={`${nextOccupation.displayName}, ${content["results.moreInfo"]}`}
							>
								<img
									src={nextOccupation.imageUrl}
									alt=""
									className="w-full h-[190px] object-cover rounded-xl aspect-[3/2]"
								/>

								<p className="text-base font-medium px-[3px]">
									{nextOccupation.displayName}
								</p>
							</Link>
						))}
					</div>
				</div>
			)}
		</>
	);
}
