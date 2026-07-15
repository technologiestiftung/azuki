import { useEffect } from "react";
import { useAppStore } from "../../store/useAppStore";
import { useMatchResultsStore } from "../../store/useMatchResultsStore";
import { fetchVacancies } from "../../api/client";
import { content } from "../../content";

/** Prefetch vacancy previews as soon as results are shown (both tabs share the header). */
export function useFetchVacancies(): void {
	const matchResults = useMatchResultsStore((state) => state.matchResults);
	const vacancies = useAppStore((state) => state.vacancies);
	const setVacancies = useAppStore((state) => state.setVacancies);
	const setVacanciesFetchError = useAppStore(
		(state) => state.setVacanciesFetchError,
	);
	const location = useAppStore((state) => state.location);
	const preferredJobs = useAppStore((state) => state.profile.preferredJobs);
	const occupations = matchResults?.occupations ?? [];

	useEffect(() => {
		if (occupations.length === 0 || vacancies !== null) {
			return () => {};
		}

		const controller = new AbortController();
		const occupationNames = occupations.map((occupation) => occupation.rawName);
		setVacanciesFetchError(null);

		(async () => {
			try {
				const response = await fetchVacancies(
					location.postcode,
					occupationNames,
					{
						distance: location.distance,
						preferredJobs,
						signal: controller.signal,
					},
				);
				if (!controller.signal.aborted) {
					setVacancies(response);
				}
			} catch (err) {
				if (controller.signal.aborted) {
					return;
				}
				if (err instanceof DOMException && err.name === "AbortError") {
					return;
				}
				setVacanciesFetchError(content["results.fetchError"]);
			}
		})();

		return () => {
			controller.abort();
		};
	}, [
		vacancies,
		occupations,
		preferredJobs,
		setVacancies,
		setVacanciesFetchError,
		location.postcode,
		location.distance,
	]);
}
