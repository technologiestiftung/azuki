import { useEffect } from "react";
import { useAppStore } from "../../store/useAppStore";
import { useMatchResultsStore } from "../../store/useMatchResultsStore";
import { fetchAusbildungsplaetze } from "../../api/client";
import { content } from "../../content";

/** Prefetch vacancy previews as soon as results are shown (both tabs share the header). */
export function useFetchAusbildungsplaetze(): void {
	const matchResults = useMatchResultsStore((state) => state.matchResults);
	const ausbildungsplaetze = useAppStore((state) => state.ausbildungsplaetze);
	const setAusbildungsplaetze = useAppStore(
		(state) => state.setAusbildungsplaetze,
	);
	const setAusbildungsplaetzeFetchError = useAppStore(
		(state) => state.setAusbildungsplaetzeFetchError,
	);
	const location = useAppStore((state) => state.location);
	const occupations = matchResults?.occupations ?? [];

	useEffect(() => {
		if (occupations.length === 0 || ausbildungsplaetze !== null) {
			return () => {};
		}

		const controller = new AbortController();
		const occupationNames = occupations.map((occupation) => occupation.rawName);
		setAusbildungsplaetzeFetchError(null);

		(async () => {
			try {
				const response = await fetchAusbildungsplaetze(
					location.postcode,
					occupationNames,
					{
						distance: location.distance,
						signal: controller.signal,
					},
				);
				if (!controller.signal.aborted) {
					setAusbildungsplaetze(response);
				}
			} catch (err) {
				if (controller.signal.aborted) {
					return;
				}
				if (err instanceof DOMException && err.name === "AbortError") {
					return;
				}
				setAusbildungsplaetzeFetchError(content["results.fetchError"]);
			}
		})();

		return () => {
			controller.abort();
		};
	}, [
		ausbildungsplaetze,
		occupations,
		setAusbildungsplaetze,
		setAusbildungsplaetzeFetchError,
		location.postcode,
		location.distance,
	]);
}
