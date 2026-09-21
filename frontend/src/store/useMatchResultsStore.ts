import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { MatchResult, VacanciesResponse } from "../common";

export type ListFilterOrigin = "system" | "user";

interface MatchResultsState {
	matchResults: MatchResult | null;
	favoriteOccupationIds: number[];
	favoriteVacancyKeys: string[];
	vacancyOccupationFilterIds: number[];
	vacancyOccupationFilterOrigin: ListFilterOrigin | null;
	occupationTypeTagFilterIds: string[];
	vacanciesCount: number | undefined;
	resultsListScrollTop: number;
}

interface MatchResultsActions {
	setMatchResults: (results: MatchResult) => void;
	clearMatchResults: () => void;
	syncVacanciesCount: (vacancies: VacanciesResponse | null) => void;
	toggleFavorite: (occupationId: number) => void;
	toggleVacancyFavorite: (vacancyKey: string) => void;
	setVacancyOccupationFilterIds: (
		occupationIds: number[],
		origin?: ListFilterOrigin,
	) => void;
	clearSystemVacancyOccupationFilter: () => void;
	setOccupationTypeTagFilterIds: (tagIds: string[]) => void;
	setResultsListScrollTop: (value: number) => void;
}

export const useMatchResultsStore = create<
	MatchResultsState & MatchResultsActions
>()(
	persist(
		(set) => ({
			matchResults: null,
			favoriteOccupationIds: [],
			favoriteVacancyKeys: [],
			vacancyOccupationFilterIds: [],
			vacancyOccupationFilterOrigin: null,
			occupationTypeTagFilterIds: [],
			vacanciesCount: undefined,
			resultsListScrollTop: 0,

			setMatchResults: (results) =>
				set((state) => {
					const resultIds = new Set([
						...results.occupations.map((o) => o.id),
						...results.wildcardOccupations.map((o) => o.id),
					]);
					return {
						matchResults: results,
						favoriteOccupationIds: state.favoriteOccupationIds.filter((id) =>
							resultIds.has(id),
						),
					};
				}),

			clearMatchResults: () =>
				set({
					matchResults: null,
					favoriteOccupationIds: [],
					favoriteVacancyKeys: [],
					vacancyOccupationFilterIds: [],
					vacancyOccupationFilterOrigin: null,
					occupationTypeTagFilterIds: [],
					vacanciesCount: undefined,
					resultsListScrollTop: 0,
				}),

			syncVacanciesCount: (vacancies) =>
				set((state) => {
					if (!state.matchResults || !vacancies) {
						return { vacanciesCount: undefined };
					}

					const vacanciesByName = new Map(
						vacancies.results.map((result) => [result.occupation, result]),
					);

					return {
						vacanciesCount: state.matchResults.occupations.reduce(
							(count, occupation) => {
								const previews =
									vacanciesByName.get(occupation.rawName)?.previews.length ?? 0;
								return count + previews;
							},
							0,
						),
					};
				}),

			toggleFavorite: (occupationId) =>
				set((state) => ({
					favoriteOccupationIds: state.favoriteOccupationIds.includes(
						occupationId,
					)
						? state.favoriteOccupationIds.filter((id) => id !== occupationId)
						: [...state.favoriteOccupationIds, occupationId],
				})),

			toggleVacancyFavorite: (vacancyKey) =>
				set((state) => ({
					favoriteVacancyKeys: state.favoriteVacancyKeys.includes(vacancyKey)
						? state.favoriteVacancyKeys.filter((key) => key !== vacancyKey)
						: [...state.favoriteVacancyKeys, vacancyKey],
				})),

			setVacancyOccupationFilterIds: (occupationIds, origin = "user") =>
				set({
					vacancyOccupationFilterIds: occupationIds,
					vacancyOccupationFilterOrigin:
						occupationIds.length === 0 ? null : origin,
				}),

			clearSystemVacancyOccupationFilter: () =>
				set((state) =>
					state.vacancyOccupationFilterOrigin === "system"
						? {
								vacancyOccupationFilterIds: [],
								vacancyOccupationFilterOrigin: null,
							}
						: {},
				),

			setOccupationTypeTagFilterIds: (tagIds) =>
				set({
					occupationTypeTagFilterIds: tagIds,
				}),

			setResultsListScrollTop: (value) => set({ resultsListScrollTop: value }),
		}),
		{
			name: "azuki-match-results-store",
			storage: createJSONStorage(() => sessionStorage),
			partialize: (state) => ({
				matchResults: state.matchResults,
				favoriteOccupationIds: state.favoriteOccupationIds,
				favoriteVacancyKeys: state.favoriteVacancyKeys,
			}),
		},
	),
);
