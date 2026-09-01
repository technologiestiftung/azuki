import { useEffect, useRef } from "react";
import { useAppStore } from "../../store/useAppStore";
import { useMatchResultsStore } from "../../store/useMatchResultsStore";
import { fetchSharedVacancies, fetchVacancies } from "../../api/client";
import { content } from "../../content";

export interface SharedVacancyParams {
	occupationsParam: string;
	postcode?: string;
	distance?: string;
}

interface UseFetchVacanciesOptions {
	pauseWhileLoadingShared?: boolean;
	sharedVacancyParams?: SharedVacancyParams;
}

const MAX_VACANCY_OCCUPATION_NAMES = 20;
const MAX_WILDCARD_VACANCY_OCCUPATION_NAMES = 5;

function buildVacancyFetchKey(params: {
	occupationNames: string[];
	postcode: string;
	distance: number;
	preferredJobs: string[];
}): string {
	return `${params.postcode}:${params.distance}:${params.occupationNames.join("|")}:${params.preferredJobs.join("|")}`;
}

function buildSharedVacancyFetchKey(params: SharedVacancyParams): string {
	return `${params.postcode ?? ""}:${params.distance ?? ""}:${params.occupationsParam}`;
}

/** Prefetch vacancy previews as soon as results are shown (both tabs share the header). */
export function useFetchVacancies(
	options: UseFetchVacanciesOptions = {},
): void {
	const { pauseWhileLoadingShared = false, sharedVacancyParams } = options;
	const matchResults = useMatchResultsStore((state) => state.matchResults);
	const vacancies = useAppStore((state) => state.vacancies);
	const setVacancies = useAppStore((state) => state.setVacancies);
	const setVacanciesFetchError = useAppStore(
		(state) => state.setVacanciesFetchError,
	);
	const location = useAppStore((state) => state.location);
	const preferredJobs = useAppStore((state) => state.profile.preferredJobs);
	const occupations = matchResults?.occupations;
	const wildcardOccupations = matchResults?.wildcardOccupations;
	const activeFetchKeyRef = useRef<string | null>(null);

	useEffect(() => {
		if (pauseWhileLoadingShared || vacancies !== null) {
			return () => {};
		}

		const controller = new AbortController();
		let fetchKey: string;
		let fetchPromise: ReturnType<typeof fetchVacancies>;

		if (sharedVacancyParams) {
			fetchKey = buildSharedVacancyFetchKey(sharedVacancyParams);
			fetchPromise = fetchSharedVacancies(
				sharedVacancyParams.occupationsParam,
				{
					postcode: sharedVacancyParams.postcode,
					distance: sharedVacancyParams.distance
						? Number.parseInt(sharedVacancyParams.distance, 10)
						: undefined,
					signal: controller.signal,
				},
			);
		} else {
			if (!occupations?.length) {
				return () => {};
			}
			// Wildcard names get their own reserved slots so they aren't crowded
			// out when regular matches already fill the main budget.
			const occupationNames = [
				...occupations
					.map((occupation) => occupation.rawName)
					.slice(0, MAX_VACANCY_OCCUPATION_NAMES),
				...(wildcardOccupations ?? [])
					.map((occupation) => occupation.rawName)
					.slice(0, MAX_WILDCARD_VACANCY_OCCUPATION_NAMES),
			];
			fetchKey = buildVacancyFetchKey({
				occupationNames,
				postcode: location.postcode,
				distance: location.distance,
				preferredJobs,
			});
			fetchPromise = fetchVacancies(location.postcode, occupationNames, {
				distance: location.distance,
				preferredJobs,
				signal: controller.signal,
			});
		}

		activeFetchKeyRef.current = fetchKey;
		setVacanciesFetchError(null);

		(async () => {
			try {
				const response = await fetchPromise;
				if (
					controller.signal.aborted ||
					activeFetchKeyRef.current !== fetchKey
				) {
					return;
				}
				setVacancies(response);
			} catch (err) {
				if (controller.signal.aborted) {
					return;
				}
				if (err instanceof DOMException && err.name === "AbortError") {
					return;
				}
				if (activeFetchKeyRef.current !== fetchKey) {
					return;
				}
				setVacanciesFetchError(content["results.fetchError"]);
			}
		})();

		return () => {
			controller.abort();
			if (activeFetchKeyRef.current === fetchKey) {
				activeFetchKeyRef.current = null;
			}
		};
	}, [
		pauseWhileLoadingShared,
		sharedVacancyParams,
		vacancies,
		occupations,
		wildcardOccupations,
		preferredJobs,
		setVacancies,
		setVacanciesFetchError,
		location.postcode,
		location.distance,
	]);
}
