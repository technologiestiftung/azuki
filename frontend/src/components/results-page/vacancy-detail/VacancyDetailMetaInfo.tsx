import { useState } from "react";
import type { VacancyDetail } from "@azuki/shared";
import { content } from "../../../content";
import { formatStartDate } from "../vacancies-page/VacancyCard";
import { formatVacancyEducationLevel } from "../utils/formatVacancyEducationLevel";
import { InfoBottomSheet } from "../occupation-detail/InfoBottomSheet";
import { VacancyAddressList } from "./VacancyAddressList";

interface VacancyDetailMetaInfoProps {
	detail: VacancyDetail;
}

function formatEmploymentType(isFullTime: boolean | null) {
	if (isFullTime === null) {
		return null;
	}
	return isFullTime
		? content["vacancies.detail.employmentType.fullTime"]
		: content["vacancies.detail.employmentType.partTime"];
}

export function VacancyDetailMetaInfo({ detail }: VacancyDetailMetaInfoProps) {
	const startDate = formatStartDate(detail.startDate);

	const employmentTypeLabel = formatEmploymentType(detail.isFullTime);
	const schoolDegreeLabel = formatVacancyEducationLevel(detail.educationLevel);
	const unknown = content["results.detail.salary.unknown"];
	const [schoolDegreeInfoOpen, setSchoolDegreeInfoOpen] = useState(false);

	return (
		<>
			<div className="flex flex-col gap-0.5">
				<div className="flex w-full gap-0.5">
					<div className="flex flex-col gap-1.5 rounded-tl-xl flex-1 px-4 py-3 bg-sky-50">
						<span className="text-sky-shade-110 text-base font-normal">
							{content["vacancies.detail.startTitle"]}
						</span>
						<span className="text-sky-900 text-xl font-semibold text-start">
							{startDate ?? unknown}
						</span>
					</div>
					<div className="flex flex-col gap-1.5 flex-1 px-4 py-3 bg-sky-50 rounded-tr-xl">
						<span className="text-sky-shade-110 text-base font-normal">
							{content["vacancies.detail.employmentTypeTitle"]}
						</span>
						<span className="text-sky-900 text-xl font-semibold text-start">
							{employmentTypeLabel ?? unknown}
						</span>
					</div>
				</div>
				<button
					type="button"
					onClick={() => setSchoolDegreeInfoOpen(true)}
					aria-label={`${content["results.detail.schoolDegreeTitle"]}: ${schoolDegreeLabel ?? unknown}, ${content["results.moreInfo"]}`}
					className="flex flex-col gap-1.5 flex-1 px-4 py-3 bg-sky-50 text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
				>
					<span className="flex justify-between items-center text-sky-shade-110 text-base font-normal">
						{content["results.detail.schoolDegreeTitle"]}
						<img src="/icons/info.svg" alt="" className="w-5 h-5" aria-hidden />
					</span>
					<span className="text-sky-900 text-xl font-semibold text-start">
						{schoolDegreeLabel ?? unknown}
					</span>
				</button>
				<div className="flex flex-col gap-1.5 flex-1 px-4 py-3 bg-sky-50 rounded-b-xl">
					<span className="text-sky-shade-110 text-base font-normal">
						{content["vacancies.detail.locationTitle"]}
					</span>
					<VacancyAddressList addresses={detail.addresses} />
				</div>
			</div>
			<InfoBottomSheet
				open={schoolDegreeInfoOpen}
				onClose={() => setSchoolDegreeInfoOpen(false)}
				title={content["results.detail.schoolDegreeInfo.title"]}
				description={content["results.detail.schoolDegreeInfo.description"]}
			/>
		</>
	);
}
