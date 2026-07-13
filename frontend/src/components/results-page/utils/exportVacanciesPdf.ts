import {
	formatOccupationDisplayName,
	type MatchedOccupation,
	type VacancyPreview,
} from "@azuki/shared";
import { content } from "../../../content";
import { formatVacancyLocation } from "./formatVacancyLocation";
import { exportPdfTable } from "./exportPdfTable";

const TABLE_HEADERS = [
	content["vacancies.export.occupation"],
	content["vacancies.export.employer"],
	content["vacancies.export.location"],
	content["vacancies.export.startDate"],
	content["vacancies.export.publishedAt"],
] as const;

function formatIsoDate(iso: string | undefined): string {
	if (!iso) {
		return "";
	}
	const parsed = new Date(iso);
	if (Number.isNaN(parsed.getTime())) {
		return "";
	}
	const dd = String(parsed.getDate()).padStart(2, "0");
	const mm = String(parsed.getMonth() + 1).padStart(2, "0");
	const yyyy = parsed.getFullYear();
	return `${dd}.${mm}.${yyyy}`;
}

export interface VacancyExportRow {
	occupation: MatchedOccupation;
	preview: VacancyPreview;
}

export function exportVacanciesPdf(rows: VacancyExportRow[]): void {
	if (rows.length === 0) {
		return;
	}

	exportPdfTable({
		filename: content["vacancies.export.filename"],
		title: content["vacancies.title"],
		head: [...TABLE_HEADERS],
		body: rows.map(({ occupation, preview }) => [
			formatOccupationDisplayName(occupation.name),
			preview.employer,
			formatVacancyLocation(preview),
			formatIsoDate(preview.startDate),
			formatIsoDate(preview.publishedAt),
		]),
		columnWeights: [2, 2, 2.5, 1.2, 1.2],
	});
}
