import { useEffect, useMemo, useState } from "react";
import { formatOccupationDisplayName, type Occupation } from "@azuki/shared";
import { getOccupation } from "../../../api/client";
import { content } from "../../../content";
import { useMatchResultsStore } from "../../../store/useMatchResultsStore";

interface OccupationDetailState {
	occupation: Occupation | null;
	loading: boolean;
	error: string | null;
	matchedOccupation: ReturnType<typeof findMatchedOccupation>;
	isFavorite: boolean;
	toggleFavorite: () => void;
	displayName: string;
	heroImage: string | undefined;
}

function findMatchedOccupation(
	occupationId: number,
	matchResults: ReturnType<
		typeof useMatchResultsStore.getState
	>["matchResults"],
) {
	return matchResults?.occupations.find(
		(occupation) => occupation.id === occupationId,
	);
}

export function useOccupationDetail(
	occupationId: number,
): OccupationDetailState {
	const matchResults = useMatchResultsStore((state) => state.matchResults);
	const isFavorite = useMatchResultsStore((state) =>
		state.favoriteOccupationIds.includes(occupationId),
	);
	const toggleFavoriteStore = useMatchResultsStore(
		(state) => state.toggleFavorite,
	);

	const matchedOccupation = useMemo(
		() => findMatchedOccupation(occupationId, matchResults),
		[matchResults, occupationId],
	);

	const [occupation, setOccupation] = useState<Occupation | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!Number.isFinite(occupationId)) {
			setLoading(false);
			setError(content["results.detail.notFound"]);
			return undefined;
		}

		let cancelled = false;
		setLoading(true);
		setError(null);

		getOccupation(occupationId)
			.then((data) => {
				if (!cancelled) {
					setOccupation(data);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setError(content["results.detail.loadError"]);
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
	}, [occupationId]);

	const displayName = formatOccupationDisplayName(
		matchedOccupation?.name ?? occupation?.name ?? "",
	);

	const heroImage =
		matchedOccupation?.images[0]?.url ?? occupation?.images[0]?.url;

	return {
		occupation,
		loading,
		error,
		matchedOccupation,
		isFavorite,
		toggleFavorite: () => toggleFavoriteStore(occupationId),
		displayName,
		heroImage,
	};
}
