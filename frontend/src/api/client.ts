import type { UserProfile, MatchResult, EvalSnapshot } from "@azuki/shared";

type HeadersInit = Record<string, string>;

const API_BASE = import.meta.env.VITE_API_URL || "/api";

let appPassword: string | null = null;

export function setAppPassword(password: string) {
	appPassword = password;
}

export function isAuthenticated(): boolean {
	return appPassword !== null;
}

function headers(): HeadersInit {
	const h: HeadersInit = { "Content-Type": "application/json" };
	if (appPassword) {
		h["x-app-password"] = appPassword;
	}
	return h;
}

export async function matchProfile(
	profile: UserProfile,
	model?: string,
): Promise<MatchResult> {
	const res = await fetch(`${API_BASE}/match`, {
		method: "POST",
		headers: headers(),
		body: JSON.stringify({ profile, model }),
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

export async function getDefaultPrompt(): Promise<string> {
	const res = await fetch(`${API_BASE}/eval/default-prompt`, {
		headers: headers(),
	});
	if (!res.ok) {
		throw new Error(`getDefaultPrompt failed: ${res.status}`);
	}
	const data = (await res.json()) as { prompt: string };
	return data.prompt;
}

export async function runEvalRequest(
	systemPrompt: string,
	model: string,
): Promise<EvalSnapshot> {
	const res = await fetch(`${API_BASE}/eval/run`, {
		method: "POST",
		headers: headers(),
		body: JSON.stringify({ systemPrompt, model }),
	});
	if (!res.ok) {
		throw new Error(`runEval failed: ${res.status}`);
	}
	return res.json();
}
