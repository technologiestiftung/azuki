import type { UserProfile, MatchResult, AusbildungsplaetzeResponse } from "@azuki/shared";

type HeadersInit = Record<string, string>;

const API_BASE = import.meta.env.VITE_API_URL || "/api";

let appPassword: string | null = null;

export function setAppPassword(password: string) {
	appPassword = password;
}

function headers(): HeadersInit {
	const h: HeadersInit = { "Content-Type": "application/json" };
	if (appPassword) {
		h["x-app-password"] = appPassword;
	}
	return h;
}

export async function matchProfile(profile: UserProfile): Promise<MatchResult> {
	const res = await fetch(`${API_BASE}/match`, {
		method: "POST",
		headers: headers(),
		body: JSON.stringify(profile),
	});

	if (!res.ok) {
		throw new Error(`Match failed: ${res.status}`);
	}

	return res.json();
}

export async function unlock(password: string): Promise<boolean> {
	const res = await fetch(`${API_BASE}/unlock`, {
		method: "POST",
		headers: { "Content-Type": "application/json", "x-app-password": password },
	});
	if (res.ok) {
		setAppPassword(password);
		return true;
	}
	return false;
}

export async function fetchAusbildungsplaetze(
	plz: string,
	berufe: string[],
	umkreis?: number,
): Promise<AusbildungsplaetzeResponse> {
	const res = await fetch(`${API_BASE}/ausbildungsplaetze`, {
		method: "POST",
		headers: headers(),
		body: JSON.stringify({ plz, berufe, umkreis }),
	});

	if (!res.ok) {
		throw new Error(`Ausbildungsplaetze fetch failed: ${res.status}`);
	}

	return res.json();
}
