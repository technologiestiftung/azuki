import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
	SHARED_DISTANCE_PARAM,
	SHARED_OCCUPATIONS_PARAM,
	SHARED_POSTCODE_PARAM,
} from "@azuki/shared";
import { fetchSharedMatch } from "../../api/client";
import { useMatchResultsStore } from "../../store/useMatchResultsStore";
import { DEFAULT_LOCATION, useAppStore } from "../../store/useAppStore";

export function useSharedMatchResults() {
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

	useEffect(() => {
		if (!sharedParam) {
			setIsLoadingShared(false);
			setSharedLoadError(false);
			return () => {};
		}

		useAppStore.setState({
			vacancies: null,
			vacanciesFetchError: null,
		});
		useMatchResultsStore.getState().syncVacanciesCount(null);

		if (sharedPostcode) {
			const distance = sharedDistance
				? Number.parseInt(sharedDistance, 10)
				: DEFAULT_LOCATION.distance;
			setLocation({
				postcode: sharedPostcode,
				distance: Number.isFinite(distance)
					? distance
					: DEFAULT_LOCATION.distance,
				locality: null,
				isUserSelected: true,
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
				setMatchResults(results);
				setIsLoadingShared(false);
			} catch {
				if (!cancelled) {
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
		sharedVacancyParams,
	};
}
