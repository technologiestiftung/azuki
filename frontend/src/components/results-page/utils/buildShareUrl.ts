import {
	displayFitPercent,
	type MatchedOccupation,
	buildSharedOccupationsParam,
	SHARED_OCCUPATIONS_PARAM,
	SHARED_POSTCODE_PARAM,
	SHARED_DISTANCE_PARAM,
} from "@azuki/shared";
import type { Location } from "../../../store/useAppStore";

export function buildShareUrl(
	pathname: string,
	occupations: MatchedOccupation[],
	location?: Pick<Location, "postcode" | "distance">,
): string {
	const url = new URL(pathname, window.location.origin);
	url.searchParams.set(
		SHARED_OCCUPATIONS_PARAM,
		buildSharedOccupationsParam(
			occupations.map((occupation) => ({
				id: occupation.id,
				fit: displayFitPercent(occupation),
			})),
		),
	);
	if (location) {
		url.searchParams.set(SHARED_POSTCODE_PARAM, location.postcode);
		url.searchParams.set(SHARED_DISTANCE_PARAM, String(location.distance));
	}
	return url.toString();
}
