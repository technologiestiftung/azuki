import type {
	UserProfile,
	MatchResult,
	VacanciesResponse,
	EvalSnapshot,
	Persona,
} from "@azuki/shared";

type HeadersInit = Record<string, string>;

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const APP_PASSWORD_STORAGE_KEY = "azuki-app-password";

let appPassword: string | null = sessionStorage.getItem(
	APP_PASSWORD_STORAGE_KEY,
);

export function setAppPassword(password: string) {
	appPassword = password;
	sessionStorage.setItem(APP_PASSWORD_STORAGE_KEY, password);
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

export async function fetchVacancies(
	postcode: string,
	occupations: string[],
	options: { distance?: number; signal?: AbortSignal } = {},
): Promise<VacanciesResponse> {
	const { distance, signal } = options;
	const res = await fetch(`${API_BASE}/vacancies`, {
		method: "POST",
		headers: headers(),
		body: JSON.stringify({ postcode, occupations, distance }),
		signal,
	});

	if (!res.ok) {
		throw new Error(`Vacancies fetch failed: ${res.status}`);
	}

	return res.json();
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
	personaIds: string[],
): Promise<EvalSnapshot> {
	const res = await fetch(`${API_BASE}/eval/run`, {
		method: "POST",
		headers: headers(),
		body: JSON.stringify({ systemPrompt, model, personaIds }),
	});
	if (!res.ok) {
		throw new Error(`runEval failed: ${res.status}`);
	}
	return res.json();
}

export interface PersonaInput {
	name: string;
	description: string | null;
	profile: UserProfile;
	tierS: number[];
	tierA: number[];
	tierC: number[];
}

export async function listPersonas(): Promise<Persona[]> {
	const res = await fetch(`${API_BASE}/personas`, { headers: headers() });
	if (!res.ok) {
		throw new Error(`listPersonas failed: ${res.status}`);
	}
	return res.json();
}

export async function getPersona(id: string): Promise<Persona> {
	const res = await fetch(`${API_BASE}/personas/${id}`, { headers: headers() });
	if (!res.ok) {
		throw new Error(`getPersona failed: ${res.status}`);
	}
	return res.json();
}

export async function createPersona(input: PersonaInput): Promise<Persona> {
	const res = await fetch(`${API_BASE}/personas`, {
		method: "POST",
		headers: headers(),
		body: JSON.stringify(input),
	});
	if (!res.ok) {
		throw new Error(`createPersona failed: ${res.status}`);
	}
	return res.json();
}

export async function updatePersona(
	id: string,
	input: PersonaInput,
): Promise<Persona> {
	const res = await fetch(`${API_BASE}/personas/${id}`, {
		method: "PUT",
		headers: headers(),
		body: JSON.stringify(input),
	});
	if (!res.ok) {
		throw new Error(`updatePersona failed: ${res.status}`);
	}
	return res.json();
}

export async function deletePersona(id: string): Promise<void> {
	const res = await fetch(`${API_BASE}/personas/${id}`, {
		method: "DELETE",
		headers: headers(),
	});
	if (!res.ok) {
		throw new Error(`deletePersona failed: ${res.status}`);
	}
}
