import { buildResultsOccupationPath } from "../../../routing/routes";

export interface OccupationShareState {
	fitPercent: number;
	nextOccupationIds: number[];
}

export const SHARE_PARAM_FIT = "fit";
export const SHARE_PARAM_NEXT = "next";

function parseOccupationIdList(value: string | null): number[] {
	if (!value) {
		return [];
	}
	return value
		.split(",")
		.map((part) => Number(part.trim()))
		.filter((id) => Number.isFinite(id) && id > 0);
}

// Share URLs encode a snapshot of the sender's view (fit %, next occupations).
// Match pills come from the AI explanations API for the viewer's profile.
export function parseOccupationShareState(
	searchParams: URLSearchParams,
): OccupationShareState | null {
	const fitRaw = searchParams.get(SHARE_PARAM_FIT);
	if (fitRaw === null) {
		return null;
	}

	const fitPercent = Number(fitRaw);
	if (!Number.isFinite(fitPercent) || fitPercent < 0 || fitPercent > 100) {
		return null;
	}

	return {
		fitPercent: Math.round(fitPercent),
		nextOccupationIds: parseOccupationIdList(
			searchParams.get(SHARE_PARAM_NEXT),
		),
	};
}

export function buildOccupationShareState(
	fitPercent: number | undefined,
	nextOccupationIds: number[],
): OccupationShareState | null {
	if (fitPercent === undefined) {
		return null;
	}

	return {
		fitPercent,
		nextOccupationIds,
	};
}

export function buildOccupationShareUrl(
	occupationId: number,
	state: OccupationShareState,
	baseOrigin: string = typeof window !== "undefined"
		? window.location.origin
		: "http://localhost",
): string {
	const url = new URL(buildResultsOccupationPath(occupationId), baseOrigin);
	url.searchParams.set(SHARE_PARAM_FIT, String(state.fitPercent));

	if (state.nextOccupationIds.length > 0) {
		url.searchParams.set(SHARE_PARAM_NEXT, state.nextOccupationIds.join(","));
	}

	return url.toString();
}
