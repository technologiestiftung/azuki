import {
	SHARED_DISTANCE_PARAM,
	SHARED_OCCUPATIONS_PARAM,
	SHARED_POSTCODE_PARAM,
	SHARED_PROFILE_PARAM,
} from "@azuki/shared";
import type { To } from "react-router-dom";
import {
	SHARE_PARAM_FIT,
	SHARE_PARAM_NEXT,
} from "../components/results-page/occupation-detail/occupationShareState";
import { useAppStore } from "../store/useAppStore";
import { useMatchResultsStore } from "../store/useMatchResultsStore";

const APP_STORE_KEY = "azuki-app-store";
const MATCH_RESULTS_STORE_KEY = "azuki-match-results-store";

const SHARE_SEARCH_KEYS = [
	SHARED_OCCUPATIONS_PARAM,
	SHARED_PROFILE_PARAM,
	SHARED_POSTCODE_PARAM,
	SHARED_DISTANCE_PARAM,
	SHARE_PARAM_FIT,
	SHARE_PARAM_NEXT,
] as const;

export function hasShareQueryParams(searchParams: URLSearchParams): boolean {
	return (
		searchParams.has(SHARED_OCCUPATIONS_PARAM) ||
		searchParams.has(SHARED_PROFILE_PARAM) ||
		searchParams.has(SHARE_PARAM_FIT)
	);
}

export function hasResultsShareParams(searchParams: URLSearchParams): boolean {
	return (
		searchParams.has(SHARED_OCCUPATIONS_PARAM) ||
		searchParams.has(SHARE_PARAM_FIT)
	);
}

export function hasProfileShareParams(searchParams: URLSearchParams): boolean {
	return searchParams.has(SHARED_PROFILE_PARAM);
}

/** Bottom nav only for users with their own questionnaire and no share URL. */
export function shouldShowBottomNav(
	inSchool: boolean | null,
	searchParams: URLSearchParams,
): boolean {
	return inSchool !== null && !hasShareQueryParams(searchParams);
}

/** Keeps share-related query params when moving between results pages. */
export function pickShareSearchParams(
	searchParams: URLSearchParams,
): URLSearchParams {
	const next = new URLSearchParams();
	for (const key of SHARE_SEARCH_KEYS) {
		const value = searchParams.get(key);
		if (value !== null) {
			next.set(key, value);
		}
	}
	return next;
}

export function toWithShareSearch(
	pathname: string,
	searchParams: URLSearchParams,
): To {
	const shareSearch = pickShareSearchParams(searchParams).toString();
	return shareSearch ? { pathname, search: shareSearch } : pathname;
}

export function hasLocalSession(): boolean {
	const { matchResults } = useMatchResultsStore.getState();
	const { profile } = useAppStore.getState();
	return matchResults !== null || profile.inSchool !== null;
}

/** Profile needs the user's questionnaire; shared match results alone are not enough. */
export function hasProfileSession(): boolean {
	return useAppStore.getState().profile.inSchool !== null;
}

/** Results pages need match results; a started questionnaire alone is not enough. */
export function hasResultsSession(): boolean {
	return useMatchResultsStore.getState().matchResults !== null;
}

function readPersistedProfileSession(raw: string | null): boolean {
	if (!raw) {
		return false;
	}

	try {
		const parsed = JSON.parse(raw) as {
			state?: { profile?: { inSchool?: boolean | null } };
		};
		const inSchool = parsed.state?.profile?.inSchool;
		return inSchool !== null && inSchool !== undefined;
	} catch {
		return false;
	}
}

function readPersistedMatchSession(raw: string | null): boolean {
	if (!raw) {
		return false;
	}

	try {
		const parsed = JSON.parse(raw) as {
			state?: { matchResults?: unknown };
		};
		const matchResults = parsed.state?.matchResults;
		return matchResults !== null && matchResults !== undefined;
	} catch {
		return false;
	}
}

/** Sync read before Zustand rehydration to avoid redirecting valid sessions. */
export function hasPersistedSession(): boolean {
	if (typeof sessionStorage === "undefined") {
		return false;
	}

	return (
		readPersistedMatchSession(
			sessionStorage.getItem(MATCH_RESULTS_STORE_KEY),
		) || readPersistedProfileSession(sessionStorage.getItem(APP_STORE_KEY))
	);
}

export function areSessionStoresHydrated(): boolean {
	return (
		useAppStore.persist.hasHydrated() &&
		useMatchResultsStore.persist.hasHydrated()
	);
}
