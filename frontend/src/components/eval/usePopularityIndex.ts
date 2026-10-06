import { useEffect } from "react";
import type { PopularityRecord } from "@azuki/shared";
import { useEvalStore } from "../../store/useEvalStore";

export function usePopularityIndex(): PopularityRecord[] | null {
	const popularityIndex = useEvalStore((s) => s.popularityIndex);
	const loadPopularityIndex = useEvalStore((s) => s.loadPopularityIndex);

	useEffect(() => {
		loadPopularityIndex().catch(() => {
			/* failure is exposed as popularityIndexError; a later mount retries */
		});
	}, [loadPopularityIndex]);

	return popularityIndex;
}
