import type {
	VacancyPreview,
	VacancyResult,
	MatchedOccupation,
} from "@azuki/shared";

export interface VacancyListItem {
	listKey: string;
	key: string;
	occupation: MatchedOccupation;
	preview: VacancyPreview;
}

function publishedAtTimestamp(iso: string | undefined): number {
	if (!iso) {
		return 0;
	}
	const time = new Date(iso).getTime();
	return Number.isNaN(time) ? 0 : time;
}

function compareVacanciesByPublishedAt(
	a: VacancyListItem,
	b: VacancyListItem,
): number {
	return (
		publishedAtTimestamp(b.preview.publishedAt) -
		publishedAtTimestamp(a.preview.publishedAt)
	);
}

export function buildVacancyCards({
	occupations,
	vacanciesByName,
	showFavoritesOnly,
	favoriteVacancyKeySet,
	listKeyPrefix = "",
}: {
	occupations: MatchedOccupation[];
	vacanciesByName: Map<string, VacancyResult>;
	showFavoritesOnly: boolean;
	favoriteVacancyKeySet: Set<string>;
	listKeyPrefix?: string;
}): VacancyListItem[] {
	const cards: VacancyListItem[] = [];
	for (const occupation of occupations) {
		const vacancyResult = vacanciesByName.get(occupation.rawName);
		if (!vacancyResult?.previews.length) {
			continue;
		}
		for (const preview of vacancyResult.previews) {
			const key = preview.referenznummer;
			if (!key) {
				continue;
			}
			if (showFavoritesOnly && !favoriteVacancyKeySet.has(key)) {
				continue;
			}
			cards.push({
				listKey: `${listKeyPrefix}${occupation.id}-${key}`,
				key,
				occupation,
				preview,
			});
		}
	}
	return cards.sort(compareVacanciesByPublishedAt);
}

export function getVacancyEmptyState({
	visibleOccupationCount,
	locationFilterApplied,
	showFavoritesOnly,
	loading,
	noVacancyResults,
}: {
	visibleOccupationCount: number;
	locationFilterApplied: boolean;
	showFavoritesOnly: boolean;
	loading: boolean;
	noVacancyResults: boolean;
}) {
	const showSimpleEmpty =
		visibleOccupationCount === 0 ||
		(locationFilterApplied && !loading && noVacancyResults) ||
		(showFavoritesOnly && !loading && noVacancyResults);
	const showDetailedEmpty =
		!locationFilterApplied &&
		!showFavoritesOnly &&
		!loading &&
		noVacancyResults &&
		visibleOccupationCount > 0;
	return { showSimpleEmpty, showDetailedEmpty };
}
