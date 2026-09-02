import type { MatchResult, VacanciesResponse } from "../common";

export function computeVacanciesCount(
	matchResults: MatchResult | null,
	vacancies: VacanciesResponse | null,
	filterOccupationIds: number[],
): number | undefined {
	if (!matchResults || !vacancies) {
		return undefined;
	}

	const vacanciesByName = new Map(
		vacancies.results.map((result) => [result.occupation, result]),
	);

	const filterSet =
		filterOccupationIds.length > 0 ? new Set(filterOccupationIds) : null;
	const occupations = filterSet
		? matchResults.occupations.filter((occupation) =>
				filterSet.has(occupation.id),
			)
		: matchResults.occupations;
	const wildcardOccupations = filterSet
		? matchResults.wildcardOccupations.filter((occupation) =>
				filterSet.has(occupation.id),
			)
		: matchResults.wildcardOccupations;

	return [...occupations, ...wildcardOccupations].reduce(
		(count, occupation) => {
			const previews =
				vacanciesByName.get(occupation.rawName)?.previews.length ?? 0;
			return count + previews;
		},
		0,
	);
}
