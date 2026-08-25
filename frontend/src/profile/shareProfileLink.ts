import {
	SHARED_OCCUPATIONS_PARAM,
	SHARED_PROFILE_PARAM,
	buildSharedOccupationsParam,
	buildSharedProfileParam,
	fitPercent,
} from "@azuki/shared";
import { shareResultsLink } from "../components/results-page/utils/shareResults";
import { content } from "../content";
import { ROUTE_PATHS } from "../routing/routes";
import { useAppStore } from "../store/useAppStore";
import { useMatchResultsStore } from "../store/useMatchResultsStore";

export async function shareProfileLink(): Promise<void> {
	const profile = useAppStore.getState().profile;
	const matchResults = useMatchResultsStore.getState().matchResults;
	const topOccupations = (matchResults?.occupations ?? []).slice(0, 3);

	const url = new URL(ROUTE_PATHS.profile, window.location.origin);
	url.searchParams.set(SHARED_PROFILE_PARAM, buildSharedProfileParam(profile));
	if (topOccupations.length > 0) {
		url.searchParams.set(
			SHARED_OCCUPATIONS_PARAM,
			buildSharedOccupationsParam(
				topOccupations.map((occupation) => ({
					id: occupation.id,
					fit: fitPercent(occupation.score),
				})),
			),
		);
	}

	try {
		await shareResultsLink({
			title: content["profile.share.title"],
			text: content["profile.share.text"],
			url: url.toString(),
		});
	} catch (err) {
		if (err instanceof DOMException && err.name === "AbortError") {
			return;
		}
	}
}
