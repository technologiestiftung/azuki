import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
	formatOccupationDisplayName,
	type MatchedOccupation,
	type Occupation,
	type UserProfile,
} from "@azuki/shared";
import { buildResultsOccupationPath } from "../../../routing/routes";
import { content } from "../../../content";
import { OccupationDetailMetaInfo } from "./OccupationDetailMetaInfo";
import { OccupationDetailMatchSection } from "./OccupationDetailMatchSection";
import { OccupationImageCarousel } from "./OccupationImageCarousel";
import { OccupationDetailApplyLink } from "./OccupationDetailApplyLink";
import { useAppStore } from "../../../store/useAppStore";

interface OccupationDetailBodyProps {
	occupation: Occupation | null;
	matchedOccupation: MatchedOccupation | undefined;
	matchPercent: number | undefined;
	taskItems: string[];
	profile: UserProfile;
	nextOccupations: MatchedOccupation[];
}

export function OccupationDetailBody({
	occupation,
	matchedOccupation,
	matchPercent,
	taskItems,
	profile,
	nextOccupations,
}: OccupationDetailBodyProps) {
	const inlineApplyRef = useRef<HTMLAnchorElement>(null);
	const [isInlineApplyVisible, setIsInlineApplyVisible] = useState(false);

	useEffect(() => {
		const element = inlineApplyRef.current;
		if (!element) {
			return undefined;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				setIsInlineApplyVisible(entry.isIntersecting);
			},
			{ rootMargin: "0px 0px -80px 0px", threshold: 0 },
		);

		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	const vacancies = useAppStore((state) => state.vacancies);

	const occupationVacanciesCount = useMemo(() => {
		const occupationName = matchedOccupation?.rawName;
		if (!occupationName || !vacancies) {
			return undefined;
		}
		return (
			vacancies.results.find((result) => result.occupation === occupationName)
				?.previews.length ?? 0
		);
	}, [matchedOccupation?.rawName, vacancies]);

	return (
		<>
			<div className="px-4">
				<OccupationDetailMetaInfo
					occupation={occupation}
					occupationDuration={matchedOccupation?.occupationDuration ?? ""}
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
				<div className="flex flex-col gap-5 px-3 py-5 rounded-2xl bg-sky-50 border border-sky-100">
					<div className="flex flex-col gap-[7px] text-center">
						<h3 className="text-sky-1000 text-2xl font-semibold">
							{occupationVacanciesCount !== undefined &&
							occupationVacanciesCount > 0
								? content["results.detail.apply.title"]
								: content["results.detail.apply.empty.title"]}
						</h3>
						<p className="text-lg font-normal text-sky-1000">
							{occupationVacanciesCount !== undefined &&
							occupationVacanciesCount > 0
								? content["results.detail.apply.description"]
								: content["results.detail.apply.empty.description"]}
						</p>
					</div>
					<OccupationDetailApplyLink
						ref={inlineApplyRef}
						hidden={!isInlineApplyVisible}
						occupationVacanciesCount={occupationVacanciesCount}
					/>
				</div>
			</div>
			{nextOccupations.length > 0 && (
				<div className="flex flex-col gap-2 pt-[25px] pb-4 bg-sky-50">
					<h3 className="text-sky-900 text-2xl font-semibold text-left px-[19px]">
						{content["results.detail.moreOccupations.title"]}
					</h3>
					<div className="flex gap-2 w-full overflow-x-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
						{nextOccupations.map((nextOccupation) => {
							const displayName = formatOccupationDisplayName(
								nextOccupation.name,
							);
							const imageUrl =
								nextOccupation.images[0]?.url ??
								"/illustrations/occupation-placeholder.svg";

							return (
								<Link
									key={nextOccupation.id}
									to={buildResultsOccupationPath(nextOccupation.id)}
									className="flex flex-col min-w-[300px] gap-3 px-2 pt-2 pb-4 bg-white rounded-[20px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 last:mr-4 first:ml-4"
									aria-label={`${displayName}, ${content["results.moreInfo"]}`}
								>
									<img
										src={imageUrl}
										alt=""
										className="w-full h-[190px] object-cover rounded-xl aspect-[3/2]"
									/>

									<p className="text-base font-medium px-[3px]">
										{displayName}
									</p>
								</Link>
							);
						})}
					</div>
				</div>
			)}
			{!isInlineApplyVisible &&
				occupationVacanciesCount !== undefined &&
				occupationVacanciesCount > 0 && (
					<div className="fixed bottom-0 left-0 right-0 p-4 z-40">
						<div className="px-3">
							<OccupationDetailApplyLink
								occupationVacanciesCount={occupationVacanciesCount}
							/>
						</div>
					</div>
				)}
		</>
	);
}
