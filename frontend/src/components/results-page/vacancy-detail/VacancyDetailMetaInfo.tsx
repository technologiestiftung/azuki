import type { VacancyDetail } from "@azuki/shared";
import { content } from "../../../content";
import { formatStartDate } from "../vacancies-page/VacancyCard";
import { formatVacancyEducationLevel } from "../utils/formatVacancyEducationLevel";
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

	return (
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
			<div className="flex flex-col gap-1.5 flex-1 px-4 py-3 bg-sky-50">
				<span className="text-sky-shade-110 text-base font-normal">
					{content["results.detail.schoolDegreeTitle"]}
				</span>
				<span className="text-sky-900 text-xl font-semibold text-start">
					{schoolDegreeLabel ?? unknown}
				</span>
			</div>
			<div className="flex flex-col gap-1.5 flex-1 px-4 py-3 bg-sky-50 rounded-b-xl">
				<span className="text-sky-shade-110 text-base font-normal">
					{content["vacancies.detail.locationTitle"]}
				</span>
				<VacancyAddressList addresses={detail.addresses} />
			</div>
		</div>
	);
}
