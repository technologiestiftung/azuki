import { Link, useSearchParams } from "react-router-dom";
import type { VacancyPreview } from "@azuki/shared";
import { formatOccupationDisplayName } from "@azuki/shared";
import { content } from "../../../content";
import { formatVacancyLocation } from "../utils/formatVacancyLocation";
import { formatVacancyStartDate } from "../utils/formatVacancyStartDate";
import { FavoriteButton } from "../../favorite-button/FavoriteButton";
import { buildResultsVacancyDetailPath } from "../../../routing/routes";
import { toWithShareSearch } from "../../../routing/sessionGuard";
import type { VacancyDetailNavState } from "../vacancy-detail/vacancyDetailNavState";

const NEW_VACANCY_MAX_DAYS = 3;

function startOfDay(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysSincePublished(iso: string | undefined): number | null {
	if (!iso) {
		return null;
	}
	const parsed = new Date(iso);
	if (Number.isNaN(parsed.getTime())) {
		return null;
	}
	const today = startOfDay(new Date());
	const published = startOfDay(parsed);
	const diffMs = today.getTime() - published.getTime();
	return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function formatPublishedLabel(iso: string | undefined): string | null {
	const days = daysSincePublished(iso);
	if (days === null) {
		return null;
	}
	if (days === 0) {
		return content["vacancies.published.today"];
	}
	if (days === 1) {
		return content["vacancies.published.oneDayAgo"];
	}
	return content["vacancies.published.daysAgo"].replace("{days}", String(days));
}

export interface VacancyCardProps {
	occupationName: string;
	preview: VacancyPreview;
	isFavorite: boolean;
	onToggleFavorite: () => void;
}

export function VacancyCard({
	occupationName,
	preview,
	isFavorite,
	onToggleFavorite,
}: VacancyCardProps) {
	const [searchParams] = useSearchParams();
	const startDate = formatVacancyStartDate(preview.startDate);
	const publishedLabel = formatPublishedLabel(preview.publishedAt);
	const daysSince = daysSincePublished(preview.publishedAt);
	const isNew = daysSince !== null && daysSince <= NEW_VACANCY_MAX_DAYS;
	const displayName = formatOccupationDisplayName(occupationName);
	const locationLabel = formatVacancyLocation(preview);

	return (
		<div className="relative bg-sky-shade-10 rounded-2xl overflow-hidden">
			<Link
				to={toWithShareSearch(
					buildResultsVacancyDetailPath(preview.referenznummer),
					searchParams,
				)}
				state={{ occupationName } satisfies VacancyDetailNavState}
				className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 rounded-2xl"
				aria-label={`${displayName}, ${content["results.moreInfo"]}`}
			>
				<div className="flex flex-col gap-5 p-3">
					<div className="flex justify-between items-start gap-5">
						<div className="flex flex-col gap-1">
							<h3 className="text-xl font-semibold text-sky-1000">
								{displayName}
							</h3>
							<p className="text-sky-shade-120">{preview.employer}</p>
						</div>
						<div className="shrink-0 w-7 h-7" />
					</div>

					<div className="flex flex-col gap-[3px]">
						{startDate && (
							<div className="flex items-center gap-[5px] text-sky-1000">
								<img
									src="/icons/calendar.svg"
									alt=""
									className="h-4 w-4 shrink-0"
								/>
								<span>
									{content["vacancies.startDate"]} {startDate}
								</span>
							</div>
						)}
						<div className="flex items-center gap-[5px] text-gray-900">
							<img
								src="/icons/location.svg"
								alt=""
								className="h-4 w-4 shrink-0"
							/>
							<span>{locationLabel}</span>
						</div>
					</div>
				</div>

				{publishedLabel && (
					<div
						className={`flex items-center justify-between pl-[14px] pr-3 py-3 ${
							isNew
								? "bg-sky-100"
								: "bg-sky-shade-10 border-t border-sky-shade-20"
						}`}
					>
						<span
							className={`text-sm ${isNew ? "text-sky-shade-160" : "text-sky-shade-120"}`}
						>
							{publishedLabel}
						</span>
						{isNew && (
							<div className="inline-flex h-[22px] max-w-full shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-fill-primary px-2 text-sm leading-[22px] text-white">
								{content["vacancies.badge.new"]}
							</div>
						)}
					</div>
				)}
			</Link>

			<div className="absolute top-3 right-3">
				<FavoriteButton
					onClick={onToggleFavorite}
					isFavorite={isFavorite}
					iconSize="medium"
				/>
			</div>
		</div>
	);
}
