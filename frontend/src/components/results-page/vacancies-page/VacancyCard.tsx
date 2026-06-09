import type { AusbildungsplatzResult, MatchedOccupation } from "@azuki/shared";
import { content } from "../../../content";

function formatStartDate(iso: string | undefined): string | null {
	if (!iso) {
		return null;
	}
	const parsed = new Date(iso);
	if (Number.isNaN(parsed.getTime())) {
		return null;
	}
	const dd = String(parsed.getDate()).padStart(2, "0");
	const mm = String(parsed.getMonth() + 1).padStart(2, "0");
	const yyyy = parsed.getFullYear();
	return `${dd}.${mm}.${yyyy}`;
}

export interface VacancyCardProps {
	occupation: MatchedOccupation;
	vacancies: AusbildungsplatzResult | undefined;
	distance: number;
	loading: boolean;
}

function renderVacanciesContent(
	vacancies: AusbildungsplatzResult | undefined,
	distance: number,
	loading: boolean,
) {
	if (loading && vacancies === undefined) {
		return <span className="text-sm text-gray-400">…</span>;
	}
	if (vacancies === undefined || vacancies.totalCount === 0) {
		return (
			<span className="text-sm text-gray-500">
				{content["results.badge.empty"]}
			</span>
		);
	}
	return (
		<>
			<div className="text-sm font-semibold text-sky-700 mb-3">
				{vacancies.totalCount} {content["results.badge.suffix"]} · {distance} km
			</div>

			{vacancies.previews.length > 0 && (
				<>
					<p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
						{content["results.previewHeading"]}
					</p>
					<ul className="space-y-2 mb-3">
						{vacancies.previews.map((preview, i) => {
							const startDate = formatStartDate(preview.eintrittsdatum);
							return (
								<li
									key={`${preview.employer}-${preview.city}-${i}`}
									className="text-sm"
								>
									<div className="text-gray-900 font-medium">
										{preview.employer}
									</div>
									<div className="text-gray-500">
										{preview.city}
										{startDate &&
											` · ${content["results.startDatePrefix"]} ${startDate}`}
									</div>
								</li>
							);
						})}
					</ul>
				</>
			)}

			<a
				href={vacancies.searchUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="text-sm font-medium text-sky-700 hover:text-sky-800"
			>
				{content["results.showAllLink"]} →
			</a>
		</>
	);
}

export function VacancyCard({
	occupation,
	vacancies,
	distance,
	loading,
}: VacancyCardProps) {
	return (
		<div className="bg-white rounded-2xl border border-gray-200 p-4">
			<h3 className="text-lg font-semibold text-gray-900 mb-2">
				{occupation.name}
			</h3>
			{renderVacanciesContent(vacancies, distance, loading)}
		</div>
	);
}
