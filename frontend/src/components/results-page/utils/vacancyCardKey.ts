import type { VacancyPreview } from "@azuki/shared";

export function buildVacancyCardKey(
	occupationId: number,
	preview: VacancyPreview,
	index: number,
): string {
	return `${occupationId}-${preview.employer}-${preview.postcode ?? preview.city}-${preview.street ?? preview.district ?? ""}-${index}`;
}
