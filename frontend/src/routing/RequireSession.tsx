import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_PATHS } from "./routes";
import {
	areSessionStoresHydrated,
	hasLocalSession,
	hasProfileSession,
	hasProfileShareParams,
	hasResultsSession,
	hasResultsShareParams,
	hasShareQueryParams,
} from "./sessionGuard";
import { useAppStore } from "../store/useAppStore";
import { useMatchResultsStore } from "../store/useMatchResultsStore";

interface Props {
	children: ReactNode;
	/** Results routes need match results. */
	requireMatchResults?: boolean;
	/** Profile needs a started questionnaire, not shared match results alone. */
	requireProfile?: boolean;
}

function hasShareBypass(
	searchParams: URLSearchParams,
	requireMatchResults: boolean,
	requireProfile: boolean,
): boolean {
	if (requireProfile) {
		return hasProfileShareParams(searchParams);
	}
	if (requireMatchResults) {
		return hasResultsShareParams(searchParams);
	}
	return hasShareQueryParams(searchParams);
}

function resolveHasSession(
	requireMatchResults: boolean,
	requireProfile: boolean,
): boolean {
	if (requireProfile) {
		return hasProfileSession();
	}
	if (requireMatchResults) {
		return hasResultsSession();
	}
	return hasLocalSession();
}

export function RequireSession({
	children,
	requireMatchResults = false,
	requireProfile = false,
}: Props) {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const hasShareParams = hasShareBypass(
		searchParams,
		requireMatchResults,
		requireProfile,
	);
	const [hydrated, setHydrated] = useState(areSessionStoresHydrated);

	useMatchResultsStore((state) => state.matchResults);
	useAppStore((state) => state.profile.inSchool);

	const hasSession = resolveHasSession(requireMatchResults, requireProfile);

	useEffect(() => {
		if (hydrated) {
			return undefined;
		}

		const finishHydration = () => {
			if (areSessionStoresHydrated()) {
				setHydrated(true);
			}
		};

		const unsubApp = useAppStore.persist.onFinishHydration(finishHydration);
		const unsubMatch =
			useMatchResultsStore.persist.onFinishHydration(finishHydration);
		finishHydration();

		return () => {
			unsubApp();
			unsubMatch();
		};
	}, [hydrated]);

	useEffect(() => {
		if (hasShareParams || !hydrated) {
			return;
		}

		if (!resolveHasSession(requireMatchResults, requireProfile)) {
			navigate(ROUTE_PATHS.start, { replace: true });
		}
	}, [hasShareParams, hydrated, navigate, requireMatchResults, requireProfile]);

	if (hasShareParams) {
		return <>{children}</>;
	}

	if (!hydrated) {
		return null;
	}

	if (!hasSession) {
		return null;
	}

	return <>{children}</>;
}
