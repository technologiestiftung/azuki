import { buildResultsOccupationPath } from "../../../routing/routes";
import type { OccupationMatchPillGroups } from "../utils/occupationMatchPills";
import {
	matchPillIdToShareKey,
	notMatchPillIdToShareToken,
	resolvePillsFromShareParams,
} from "../utils/occupationMatchPills";

export interface OccupationShareState {
	fitPercent: number;
	nextOccupationIds: number[];
	matchingPillKeys: string[];
	notMatchingPillTokens: string[];
}

export const SHARE_PARAM_FIT = "fit";
export const SHARE_PARAM_NEXT = "next";
export const SHARE_PARAM_MATCH = "m";
export const SHARE_PARAM_NOT_MATCH = "nm";

function parseOccupationIdList(value: string | null): number[] {
	if (!value) {
		return [];
	}
	return value
		.split(",")
		.map((part) => Number(part.trim()))
		.filter((id) => Number.isFinite(id) && id > 0);
}

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
		matchingPillKeys: splitParamList(searchParams.get(SHARE_PARAM_MATCH)),
		notMatchingPillTokens: splitParamList(
			searchParams.get(SHARE_PARAM_NOT_MATCH),
		),
	};
}

function splitParamList(value: string | null): string[] {
	if (!value) {
		return [];
	}
	return value.split(",").filter((token) => token.length > 0);
}

export function buildOccupationShareState(
	fitPercent: number | undefined,
	nextOccupationIds: number[],
	pills: OccupationMatchPillGroups,
): OccupationShareState | null {
	if (fitPercent === undefined) {
		return null;
	}

	return {
		fitPercent,
		nextOccupationIds,
		matchingPillKeys: pills.matching.map((pill) =>
			matchPillIdToShareKey(pill.id),
		),
		notMatchingPillTokens: pills.notMatching.map((pill) =>
			notMatchPillIdToShareToken(pill.id),
		),
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
	if (state.matchingPillKeys.length > 0) {
		url.searchParams.set(SHARE_PARAM_MATCH, state.matchingPillKeys.join(","));
	}
	if (state.notMatchingPillTokens.length > 0) {
		url.searchParams.set(
			SHARE_PARAM_NOT_MATCH,
			state.notMatchingPillTokens.join(","),
		);
	}

	return url.toString();
}

export function resolveSharedPills(
	state: OccupationShareState,
): OccupationMatchPillGroups {
	return resolvePillsFromShareParams(
		state.matchingPillKeys.join(",") || null,
		state.notMatchingPillTokens.join(",") || null,
	);
}
