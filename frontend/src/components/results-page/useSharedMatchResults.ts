import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
	SHARED_DISTANCE_PARAM,
	SHARED_OCCUPATIONS_PARAM,
	SHARED_POSTCODE_PARAM,
	type MatchResult,
} from "@azuki/shared";
import { fetchSharedMatch } from "../../api/client";
import { useMatchResultsStore } from "../../store/useMatchResultsStore";
import { DEFAULT_LOCATION, useAppStore } from "../../store/useAppStore";

interface UseSharedMatchResultsOptions {
	preserveOwnState?: boolean;
}

export function useSharedMatchResults(
	options: UseSharedMatchResultsOptions = {},
) {
	const { preserveOwnState = false } = options;
	const [searchParams] = useSearchParams();
	const setMatchResults = useMatchResultsStore(
		(state) => state.setMatchResults,
	);
	const setLocation = useAppStore((state) => state.setLocation);
	const sharedParam = searchParams.get(SHARED_OCCUPATIONS_PARAM);
	const sharedPostcode = searchParams.get(SHARED_POSTCODE_PARAM);
	const sharedDistance = searchParams.get(SHARED_DISTANCE_PARAM);
	const [isLoadingShared, setIsLoadingShared] = useState(Boolean(sharedParam));
	const [sharedLoadError, setSharedLoadError] = useState(false);
	const [sharedMatchResults, setSharedMatchResults] =
		useState<MatchResult | null>(null);

	useEffect(() => {
		if (!sharedParam) {
			setIsLoadingShared(false);
			setSharedLoadError(false);
			setSharedMatchResults(null);
			return () => {};
		}

		if (!preserveOwnState) {
			useAppStore.setState({
				vacancies: null,
				vacanciesFetchError: null,
			});
			useMatchResultsStore.getState().syncVacanciesCount(null);
		}

		if (!preserveOwnState && sharedPostcode) {
			const distance = sharedDistance
				? Number.parseInt(sharedDistance, 10)
				: DEFAULT_LOCATION.distance;
			setLocation({
				postcode: sharedPostcode,
				distance: Number.isFinite(distance)
					? distance
					: DEFAULT_LOCATION.distance,
				locality: null,
			});
		}

		let cancelled = false;
		setIsLoadingShared(true);
		setSharedLoadError(false);

		(async () => {
			try {
				const results = await fetchSharedMatch(sharedParam);
				if (cancelled) {
					return;
				}
				setSharedMatchResults(results);
				if (!preserveOwnState) {
					setMatchResults(results);
				}
				setIsLoadingShared(false);
			} catch {
				if (!cancelled) {
					setSharedMatchResults(null);
					setSharedLoadError(true);
					setIsLoadingShared(false);
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [
		sharedParam,
		sharedPostcode,
		sharedDistance,
		preserveOwnState,
		setLocation,
		setMatchResults,
	]);

	const sharedVacancyParams = useMemo(
		() =>
			sharedParam
				? {
						occupationsParam: sharedParam,
						postcode: sharedPostcode ?? undefined,
						distance: sharedDistance ?? undefined,
					}
				: undefined,
		[sharedParam, sharedPostcode, sharedDistance],
	);

	return {
		isLoadingShared,
		sharedLoadError,
		hasSharedParam: Boolean(sharedParam),
		sharedMatchResults,
		sharedVacancyParams,
	};
}
