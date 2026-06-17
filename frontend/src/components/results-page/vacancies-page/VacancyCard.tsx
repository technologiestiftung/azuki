import type { VacancyPreview } from "@azuki/shared";
import { formatOccupationDisplayName } from "@azuki/shared";
import { content } from "../../../content";
import {
	buildVacancyMapsUrl,
	formatVacancyLocation,
} from "../utils/formatVacancyLocation";

const NEW_VACANCY_MAX_DAYS = 3;

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
	const startDate = formatStartDate(preview.startDate);
	const publishedLabel = formatPublishedLabel(preview.publishedAt);
	const daysSince = daysSincePublished(preview.publishedAt);
	const isNew = daysSince !== null && daysSince <= NEW_VACANCY_MAX_DAYS;
	const displayName = formatOccupationDisplayName(occupationName);
	const locationLabel = formatVacancyLocation(preview);
	const mapsUrl = buildVacancyMapsUrl(preview);

	return (
		<div className="bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden">
			<div className="flex flex-col gap-5 p-3">
				<div className="flex justify-between items-start gap-5">
					<div className="flex flex-col gap-1">
						<h3 className="text-xl font-semibold text-sky-1000">
							{displayName}
						</h3>
						<p className="text-gray-500">{preview.employer}</p>
					</div>
					<button
						type="button"
						className="shrink-0 w-7 h-7 flex items-center justify-center"
						onClick={onToggleFavorite}
						aria-pressed={isFavorite}
						aria-label={
							isFavorite
								? content["results.favorite.remove"]
								: content["results.favorite.add"]
						}
					>
						<img
							src="/icons/favorite.svg"
							alt=""
							className={isFavorite ? "hidden" : "block w-7 h-7"}
						/>
						<img
							src="/icons/favorite-filled.svg"
							alt=""
							className={isFavorite ? "block w-7 h-7" : "hidden"}
						/>
					</button>
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
						{mapsUrl ? (
							<a
								href={mapsUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="underline-offset-4 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
								aria-label={content["vacancies.location.openMaps"].replace(
									"{location}",
									locationLabel,
								)}
							>
								{locationLabel}
							</a>
						) : (
							<span>{locationLabel}</span>
						)}
					</div>
				</div>
			</div>

			{publishedLabel && (
				<div
					className={`flex items-center justify-between pl-[14px] pr-3 py-3 ${
						isNew ? "bg-sky-100" : "bg-gray-100 border-t border-gray-200"
					}`}
				>
					<span
						className={`text-sm ${isNew ? "text-gray-700" : "text-gray-500"}`}
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
		</div>
	);
}
