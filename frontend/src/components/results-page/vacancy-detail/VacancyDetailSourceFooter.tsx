import { useState } from "react";
import { content } from "../../../content";
import { formatJobsucheDate } from "../utils/formatJobsucheDate";

export function VacancyDetailSourceFooter() {
	const [loadedAt] = useState(() => new Date());

	return (
		<footer className="flex flex-col px-[22px] py-5 bg-sky-900 text-sm">
			<p className="font-semibold leading-[1.4] text-sky-0">
				{content["vacancies.detail.sourceFooter.title"]}
			</p>
			<p className="leading-[1.3] text-sky-0">
				{content["vacancies.detail.sourceFooter.provider"]}{" "}
				<span className="text-sky-shade-70">
					{content["vacancies.detail.sourceFooter.date"].replace(
						"{date}",
						formatJobsucheDate(loadedAt),
					)}
				</span>
			</p>
		</footer>
	);
}
