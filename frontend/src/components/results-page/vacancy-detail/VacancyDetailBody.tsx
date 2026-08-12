import { useState } from "react";
import type { VacancyDetail } from "@azuki/shared";
import { content } from "../../../content";
import { VacancyDetailMetaInfo } from "./VacancyDetailMetaInfo";
import { ContactCard } from "../ContactCard";
import { buildJobsucheApplyUrl } from "../utils/buildJobsucheApplyUrl";

interface VacancyDetailBodyProps {
	detail: VacancyDetail;
}

export function VacancyDetailBody({ detail }: VacancyDetailBodyProps) {
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
	const applyUrl = buildJobsucheApplyUrl(detail.referenznummer);

	return (
		<>
			<div className="px-4">
				<VacancyDetailMetaInfo detail={detail} />
			</div>

			<div className="px-[18px] flex flex-col gap-3">
				<h2 className="text-sky-900 text-2xl leading-snug font-semibold">
					{content["vacancies.detail.aboutTitle"]}
				</h2>
				{detail.title && (
					<p className="text-sky-900 text-lg font-semibold">{detail.title}</p>
				)}
				{detail.description && (
					<div className="flex flex-col gap-2">
						<p
							className={`text-sky-900 text-lg leading-6 font-normal whitespace-pre-line ${
								isDescriptionExpanded ? "" : "line-clamp-6"
							}`}
						>
							{detail.description}
						</p>
						<button
							type="button"
							className="self-start flex items-center gap-2 text-base font-medium text-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
							onClick={() => setIsDescriptionExpanded((expanded) => !expanded)}
							aria-expanded={isDescriptionExpanded}
						>
							{isDescriptionExpanded
								? content["vacancies.detail.description.showLess"]
								: content["vacancies.detail.description.showMore"]}
							<img
								src={
									isDescriptionExpanded
										? "/icons/chevron-up-sky.svg"
										: "/icons/chevron-down-sky.svg"
								}
								alt=""
								className="size-5 shrink-0"
							/>
						</button>
					</div>
				)}
			</div>

			<div className="px-4">
				<div className="flex flex-col gap-5 px-3 py-5">
					<div className="flex flex-col items-center gap-5">
						<div className="flex flex-col gap-[7px] text-center">
							<h3 className="text-sky-900 text-2xl font-semibold">
								{content["vacancies.detail.applyCard.title"]}
							</h3>
							<p className="text-lg font-normal text-gray-700 leading-[140%]">
								{content["vacancies.detail.applyCard.description"]}
							</p>
						</div>
						<img
							src="/illustrations/vacancies.svg"
							alt=""
							className="h-[119px] w-full"
						/>
					</div>
					<a
						href={applyUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="h-12 flex items-center justify-center gap-2 w-full py-2 px-5 rounded-2xl text-base font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 active:bg-sky-200 active:text-sky-900 bg-sky-300 text-sky-1000 md:hover:bg-sky-200 md:hover:text-sky-900"
						aria-label={content["vacancies.detail.applyCard.cta.ariaLabel"]}
					>
						{content["vacancies.detail.applyCard.cta"]}
						<img
							src="/icons/arrow-up-right-black.svg"
							alt=""
							className="size-6"
						/>
					</a>
				</div>
			</div>

			<div className="px-4">
				<ContactCard
					title={content["vacancies.detail.contactCard.title"]}
					description={content["vacancies.detail.contactCard.description"]}
				/>
			</div>
		</>
	);
}
