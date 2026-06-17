import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { MatchResult } from "../common";

interface MatchResultsState {
	matchResults: MatchResult | null;
	favoriteOccupationIds: number[];
	favoriteVacancyKeys: string[];
}

interface MatchResultsActions {
	setMatchResults: (results: MatchResult) => void;
	clearMatchResults: () => void;
	toggleFavorite: (occupationId: number) => void;
	toggleVacancyFavorite: (vacancyKey: string) => void;
}

export const useMatchResultsStore = create<
	MatchResultsState & MatchResultsActions
>()(
	persist(
		(set) => ({
			matchResults: null,
			favoriteOccupationIds: [],
			favoriteVacancyKeys: [],

			setMatchResults: (results) =>
				set((state) => {
					const resultIds = new Set(results.occupations.map((o) => o.id));
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
