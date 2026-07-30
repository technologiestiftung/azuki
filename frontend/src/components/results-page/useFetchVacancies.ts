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

function buildVacancyFetchKey(
	occupationNames: string[],
	postcode: string,
	distance: number,
): string {
	return `${postcode}:${distance}:${occupationNames.join("|")}`;
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
	const occupations = matchResults?.occupations;
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
			const occupationNames = occupations.map(
				(occupation) => occupation.rawName,
			);
			fetchKey = buildVacancyFetchKey(
				occupationNames,
				location.postcode,
				location.distance,
			);
			fetchPromise = fetchVacancies(location.postcode, occupationNames, {
				distance: location.distance,
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
		setVacancies,
		setVacanciesFetchError,
		location.postcode,
		location.distance,
	]);
}
