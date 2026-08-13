import { useEffect, useMemo, useState } from "react";
import type { VacancyDetail, VacancyPreview } from "@azuki/shared";
import { getVacancyDetail } from "../../../api/client";
import { content } from "../../../content";
import { useAppStore } from "../../../store/useAppStore";
import { useMatchResultsStore } from "../../../store/useMatchResultsStore";

interface VacancyDetailState {
	preview: VacancyPreview | undefined;
	detail: VacancyDetail | null;
	loading: boolean;
	error: string | null;
	isFavorite: boolean;
	toggleFavorite: () => void;
}

function findPreview(
	referenznummer: string,
	vacancies: ReturnType<typeof useAppStore.getState>["vacancies"],
): VacancyPreview | undefined {
	for (const result of vacancies?.results ?? []) {
		const preview = result.previews.find(
			(candidate) => candidate.referenznummer === referenznummer,
		);
		if (preview) {
			return preview;
		}
	}
	return undefined;
}

export function useVacancyDetail(referenznummer: string): VacancyDetailState {
	const vacancies = useAppStore((state) => state.vacancies);
	const isFavorite = useMatchResultsStore((state) =>
		state.favoriteVacancyKeys.includes(referenznummer),
	);
	const toggleFavoriteStore = useMatchResultsStore(
		(state) => state.toggleVacancyFavorite,
	);

	const preview = useMemo(
		() => findPreview(referenznummer, vacancies),
		[referenznummer, vacancies],
	);

	const [detail, setDetail] = useState<VacancyDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!referenznummer) {
			setLoading(false);
			setError(content["vacancies.detail.notFound"]);
			return undefined;
		}

		let cancelled = false;
		setLoading(true);
		setError(null);

		getVacancyDetail(referenznummer)
			.then((data) => {
				if (!cancelled) {
					setDetail(data);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setError(content["vacancies.detail.loadError"]);
				}
			})
			.finally(() => {
				if (!cancelled) {
					setLoading(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [referenznummer]);

	return {
		preview,
		detail,
		loading,
		error,
		isFavorite,
		toggleFavorite: () => toggleFavoriteStore(referenznummer),
	};
}
