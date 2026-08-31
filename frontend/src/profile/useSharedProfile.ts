import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
	SHARED_OCCUPATIONS_PARAM,
	SHARED_PROFILE_PARAM,
	type MatchedOccupation,
	parseSharedProfileParam,
} from "@azuki/shared";
import { fetchSharedMatch } from "../api/client";

export function useSharedProfile() {
	const [searchParams] = useSearchParams();
	const profileParam = searchParams.get(SHARED_PROFILE_PARAM);
	const occupationsParam = searchParams.get(SHARED_OCCUPATIONS_PARAM);

	const sharedProfile = useMemo(
		() => (profileParam ? parseSharedProfileParam(profileParam) : null),
		[profileParam],
	);

	const [sharedOccupations, setSharedOccupations] = useState<
		MatchedOccupation[]
	>([]);
	const [isLoadingShared, setIsLoadingShared] = useState(
		Boolean(profileParam && occupationsParam),
	);
	const [sharedLoadError, setSharedLoadError] = useState(false);

	useEffect(() => {
		if (!sharedProfile || !occupationsParam) {
			setSharedOccupations([]);
			setIsLoadingShared(false);
			setSharedLoadError(false);
			return () => {};
		}

		let cancelled = false;
		setIsLoadingShared(true);
		setSharedLoadError(false);

		(async () => {
			try {
				const results = await fetchSharedMatch(occupationsParam);
				if (cancelled) {
					return;
				}
				setSharedOccupations(results.occupations);
				setIsLoadingShared(false);
			} catch {
				if (!cancelled) {
					setSharedOccupations([]);
					setSharedLoadError(true);
					setIsLoadingShared(false);
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [sharedProfile, occupationsParam]);

	return {
		isSharedView: sharedProfile !== null,
		sharedProfile,
		sharedOccupations,
		isLoadingShared,
		sharedLoadError,
	};
}
