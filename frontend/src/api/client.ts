import type {
	UserProfile,
	MatchResult,
	VacanciesResponse,
	EvalSnapshot,
	Persona,
	Occupation,
} from "@azuki/shared";
import {
	MOCK_MATCH_RESULT,
	MOCK_OCCUPATIONS,
	MOCK_VACANCIES_RESPONSE,
} from "./mockResults";
type HeadersInit = Record<string, string>;

const USE_MOCK_RESULTS = import.meta.env.VITE_USE_MOCK_RESULTS === "true";

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

export async function getOccupation(id: number): Promise<Occupation> {
	if (USE_MOCK_RESULTS) {
		const mock = MOCK_OCCUPATIONS.get(id);
		if (mock) {
			return Promise.resolve(mock);
		}
	}

	const res = await fetch(`${API_BASE}/occupations/${id}`, {
		headers: headers(),
	});
	if (!res.ok) {
		throw new Error(`getOccupation failed: ${res.status}`);
	}
	return res.json();
}

export interface MatchExplanationsResponse {
	matching: Array<{
		id: string;
		label: string;
		icon: string;
		summary: string;
	}>;
	notMatching: Array<{
		id: string;
		label: string;
		icon: string;
		summary: string;
	}>;
}

const MATCH_EXPLANATIONS_CACHE_PREFIX = "azuki-match-explanations:";
const MATCH_EXPLANATIONS_CACHE_INDEX_KEY = "azuki-match-explanations-index";
const MATCH_EXPLANATIONS_CACHE_MAX = 30;

const matchExplanationsMemory = new Map<string, MatchExplanationsResponse>();
const matchExplanationsInflight = new Map<
	string,
	Promise<MatchExplanationsResponse>
>();

function matchExplanationsCacheKey(
	occupationId: number,
	profile: UserProfile,
): string {
	return `${occupationId}:${JSON.stringify(profile)}`;
}

function readMatchExplanationsCache(
	key: string,
): MatchExplanationsResponse | null {
	const fromMemory = matchExplanationsMemory.get(key);
	if (fromMemory) {
		return fromMemory;
	}
	try {
		const raw = sessionStorage.getItem(
			`${MATCH_EXPLANATIONS_CACHE_PREFIX}${key}`,
		);
		if (!raw) {
			return null;
		}
		const parsed = JSON.parse(raw) as MatchExplanationsResponse;
		if (
			!parsed ||
			!Array.isArray(parsed.matching) ||
			!Array.isArray(parsed.notMatching)
		) {
			return null;
		}
		matchExplanationsMemory.set(key, parsed);
		return parsed;
	} catch {
		return null;
	}
}

/** Sync lookup for UI hydration (memory + sessionStorage). */
export function getCachedMatchExplanations(
	occupationId: number,
	profile: UserProfile,
): MatchExplanationsResponse | null {
	return readMatchExplanationsCache(
		matchExplanationsCacheKey(occupationId, profile),
	);
}

function writeMatchExplanationsCache(
	key: string,
	value: MatchExplanationsResponse,
): void {
	matchExplanationsMemory.set(key, value);
	try {
		sessionStorage.setItem(
			`${MATCH_EXPLANATIONS_CACHE_PREFIX}${key}`,
			JSON.stringify(value),
		);
		const indexRaw = sessionStorage.getItem(MATCH_EXPLANATIONS_CACHE_INDEX_KEY);
		const index: string[] = indexRaw ? (JSON.parse(indexRaw) as string[]) : [];
		const next = [key, ...index.filter((entry) => entry !== key)].slice(
			0,
			MATCH_EXPLANATIONS_CACHE_MAX,
		);
		for (const evicted of index) {
			if (!next.includes(evicted)) {
				sessionStorage.removeItem(
					`${MATCH_EXPLANATIONS_CACHE_PREFIX}${evicted}`,
				);
			}
		}
		sessionStorage.setItem(
			MATCH_EXPLANATIONS_CACHE_INDEX_KEY,
			JSON.stringify(next),
		);
	} catch {
		// Quota / private mode — memory cache still helps within the page.
	}
}

async function requestMatchExplanations(
	occupationId: number,
	profile: UserProfile,
): Promise<MatchExplanationsResponse> {
	const res = await fetch(
		`${API_BASE}/occupations/${occupationId}/match-explanations`,
		{
			method: "POST",
			headers: headers(),
			body: JSON.stringify({ profile }),
		},
	);
	if (!res.ok) {
		throw new Error(`fetchMatchExplanations failed: ${res.status}`);
	}
	return res.json();
}

export async function fetchMatchExplanations(
	occupationId: number,
	profile: UserProfile,
	signal?: AbortSignal,
): Promise<MatchExplanationsResponse> {
	const key = matchExplanationsCacheKey(occupationId, profile);
	const cached = readMatchExplanationsCache(key);
	if (cached) {
		return cached;
	}

	if (signal?.aborted) {
		throw new DOMException("Aborted", "AbortError");
	}

	let pending = matchExplanationsInflight.get(key);
	if (!pending) {
		pending = requestMatchExplanations(occupationId, profile)
			.then((result) => {
				writeMatchExplanationsCache(key, result);
				matchExplanationsInflight.delete(key);
				return result;
			})
			.catch((err) => {
				matchExplanationsInflight.delete(key);
				throw err;
			});
		matchExplanationsInflight.set(key, pending);
	}

	if (!signal) {
		return pending;
	}

	const request = pending;
	return new Promise<MatchExplanationsResponse>((resolve, reject) => {
		const onAbort = () => {
			reject(new DOMException("Aborted", "AbortError"));
		};
		signal.addEventListener("abort", onAbort, { once: true });
		request.then(
			(value) => {
				signal.removeEventListener("abort", onAbort);
				if (signal.aborted) {
					reject(new DOMException("Aborted", "AbortError"));
					return;
				}
				resolve(value);
			},
			(err) => {
				signal.removeEventListener("abort", onAbort);
				reject(err);
			},
		);
	});
}

export async function matchProfile(profile: UserProfile): Promise<MatchResult> {
	if (USE_MOCK_RESULTS) {
		return Promise.resolve(MOCK_MATCH_RESULT);
	}

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

export async function fetchSharedMatch(
	occupationsParam: string,
): Promise<MatchResult> {
	const res = await fetch(
		`${API_BASE}/shared-match?${new URLSearchParams({ o: occupationsParam })}`,
	);

	if (!res.ok) {
		throw new Error(`Shared match fetch failed: ${res.status}`);
	}

	return res.json();
}

export async function fetchSharedVacancies(
	occupationsParam: string,
	options: {
		postcode?: string;
		distance?: number;
		signal?: AbortSignal;
	} = {},
): Promise<VacanciesResponse> {
	if (USE_MOCK_RESULTS) {
		return Promise.resolve(MOCK_VACANCIES_RESPONSE);
	}

	const { postcode, distance, signal } = options;
	const params = new URLSearchParams({ o: occupationsParam });
	if (postcode) {
		params.set("plz", postcode);
	}
	if (distance !== undefined) {
		params.set("d", String(distance));
	}

	const res = await fetch(`${API_BASE}/shared-vacancies?${params}`, {
		signal,
	});

	if (!res.ok) {
		throw new Error(`Shared vacancies fetch failed: ${res.status}`);
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
	options: {
		distance?: number;
		signal?: AbortSignal;
		preferredJobs?: string[];
	} = {},
): Promise<VacanciesResponse> {
	const { distance, signal, preferredJobs = [] } = options;
	if (USE_MOCK_RESULTS) {
		return Promise.resolve(MOCK_VACANCIES_RESPONSE);
	}

	const res = await fetch(`${API_BASE}/vacancies`, {
		method: "POST",
		headers: headers(),
		body: JSON.stringify({ postcode, occupations, preferredJobs, distance }),
		signal,
	});

	if (!res.ok) {
		throw new Error(`Vacancies fetch failed: ${res.status}`);
	}

	return res.json();
}

export interface ReverseGeocodeResult {
	postcode: string;
	locality: string | null;
}

export async function reverseGeocode(
	latitude: number,
	longitude: number,
): Promise<ReverseGeocodeResult | null> {
	const res = await fetch(`${API_BASE}/reverse-geocode`, {
		method: "POST",
		headers: headers(),
		body: JSON.stringify({ latitude, longitude }),
	});

	if (res.status === 404) {
		return null;
	}

	if (!res.ok) {
		throw new Error(`Reverse geocode failed: ${res.status}`);
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
