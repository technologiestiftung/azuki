import type {
	EducationLevel,
	NoGoAnswer,
	PracticalExperienceEntry,
	UserProfile,
	WorkPreferenceChoice,
} from "./types";

export const SHARED_PROFILE_PARAM = "p";

const EDUCATION_LEVELS = new Set<EducationLevel>([
	"secondary",
	"extended_secondary",
	"intermediate",
	"none",
	"university_entrance",
	"vocational_diploma",
	"foreign_degree",
	"unknown",
]);

const EMPTY_PROFILE: UserProfile = {
	inSchool: null,
	educationLevel: null,
	favoriteSubjects: [],
	customSubjects: [],
	interests: [],
	customInterests: [],
	workExpectations: [],
	customWorkExpectations: [],
	strengths: {},
	customStrengths: [],
	selectedCustomStrengths: [],
	practicalExperiences: [],
	selectedPracticalExperienceIds: [],
	workPreferences: {},
	noGos: {},
	customNoGos: [],
};

function utf8ToBase64Url(text: string): string {
	const bytes = new TextEncoder().encode(text);
	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/g, "");
}

function base64UrlToUtf8(value: string): string {
	const padded = value
		.replace(/-/g, "+")
		.replace(/_/g, "/")
		.padEnd(Math.ceil(value.length / 4) * 4, "=");
	const binary = atob(padded);
	const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function asStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) {
		return [];
	}
	return value.filter((item): item is string => typeof item === "string");
}

function asStringNumberRecord(value: unknown): Record<string, number> {
	if (!isPlainObject(value)) {
		return {};
	}
	const result: Record<string, number> = {};
	for (const [key, entry] of Object.entries(value)) {
		if (typeof entry === "number" && Number.isFinite(entry)) {
			result[key] = entry;
		}
	}
	return result;
}

function asWorkPreferences(
	value: unknown,
): Record<string, WorkPreferenceChoice | null> {
	if (!isPlainObject(value)) {
		return {};
	}
	const result: Record<string, WorkPreferenceChoice | null> = {};
	for (const [key, entry] of Object.entries(value)) {
		if (entry === null || entry === "a" || entry === "b") {
			result[key] = entry;
		}
	}
	return result;
}

function asNoGos(value: unknown): Record<string, NoGoAnswer | null> {
	if (!isPlainObject(value)) {
		return {};
	}
	const result: Record<string, NoGoAnswer | null> = {};
	for (const [key, entry] of Object.entries(value)) {
		if (entry === null || entry === "rejected" || entry === "accepted") {
			result[key] = entry;
		}
	}
	return result;
}

function asPracticalExperiences(value: unknown): PracticalExperienceEntry[] {
	if (!Array.isArray(value)) {
		return [];
	}
	const result: PracticalExperienceEntry[] = [];
	for (const item of value) {
		if (!isPlainObject(item) || typeof item.id !== "string") {
			continue;
		}
		result.push({
			id: item.id,
			description: typeof item.description === "string" ? item.description : "",
			selectedExperienceId:
				typeof item.selectedExperienceId === "string"
					? item.selectedExperienceId
					: null,
			selectedExperienceLabel:
				typeof item.selectedExperienceLabel === "string"
					? item.selectedExperienceLabel
					: null,
			rating:
				typeof item.rating === "number" && Number.isFinite(item.rating)
					? item.rating
					: 0,
		});
	}
	return result;
}

function asEducationLevel(value: unknown): EducationLevel | null {
	if (typeof value !== "string") {
		return null;
	}
	return EDUCATION_LEVELS.has(value as EducationLevel)
		? (value as EducationLevel)
		: null;
}

/** Drop empty defaults so share URLs stay shorter. */
export function compactSharedProfile(
	profile: UserProfile,
): Record<string, unknown> {
	const compact: Record<string, unknown> = {};

	if (profile.inSchool !== null) {
		compact.inSchool = profile.inSchool;
	}
	if (profile.educationLevel !== null) {
		compact.educationLevel = profile.educationLevel;
	}
	if (profile.favoriteSubjects.length > 0) {
		compact.favoriteSubjects = profile.favoriteSubjects;
	}
	if (profile.customSubjects.length > 0) {
		compact.customSubjects = profile.customSubjects;
	}
	if (profile.interests.length > 0) {
		compact.interests = profile.interests;
	}
	if (profile.customInterests.length > 0) {
		compact.customInterests = profile.customInterests;
	}
	if (profile.workExpectations.length > 0) {
		compact.workExpectations = profile.workExpectations;
	}
	if (profile.customWorkExpectations.length > 0) {
		compact.customWorkExpectations = profile.customWorkExpectations;
	}
	if (Object.keys(profile.strengths).length > 0) {
		compact.strengths = profile.strengths;
	}
	if (profile.customStrengths.length > 0) {
		compact.customStrengths = profile.customStrengths;
	}
	if (profile.selectedCustomStrengths.length > 0) {
		compact.selectedCustomStrengths = profile.selectedCustomStrengths;
	}
	if (profile.practicalExperiences.length > 0) {
		compact.practicalExperiences = profile.practicalExperiences;
	}
	if (profile.selectedPracticalExperienceIds.length > 0) {
		compact.selectedPracticalExperienceIds =
			profile.selectedPracticalExperienceIds;
	}
	if (Object.keys(profile.workPreferences).length > 0) {
		compact.workPreferences = profile.workPreferences;
	}
	if (Object.keys(profile.noGos).length > 0) {
		compact.noGos = profile.noGos;
	}
	if (profile.customNoGos.length > 0) {
		compact.customNoGos = profile.customNoGos;
	}

	return compact;
}

export function expandSharedProfile(raw: unknown): UserProfile | null {
	if (!isPlainObject(raw)) {
		return null;
	}

	const practicalExperiences = asPracticalExperiences(raw.practicalExperiences);
	const selectedPracticalExperienceIds = asStringArray(
		raw.selectedPracticalExperienceIds,
	);

	return {
		...EMPTY_PROFILE,
		inSchool: typeof raw.inSchool === "boolean" ? raw.inSchool : null,
		educationLevel: asEducationLevel(raw.educationLevel),
		favoriteSubjects: asStringArray(raw.favoriteSubjects),
		customSubjects: asStringArray(raw.customSubjects),
		interests: asStringArray(raw.interests),
		customInterests: asStringArray(raw.customInterests),
		workExpectations: asStringArray(raw.workExpectations),
		customWorkExpectations: asStringArray(raw.customWorkExpectations),
		strengths: asStringNumberRecord(raw.strengths),
		customStrengths: asStringArray(raw.customStrengths),
		selectedCustomStrengths: asStringArray(raw.selectedCustomStrengths),
		practicalExperiences,
		selectedPracticalExperienceIds:
			selectedPracticalExperienceIds.length > 0
				? selectedPracticalExperienceIds
				: practicalExperiences.map((entry) => entry.id),
		workPreferences: asWorkPreferences(raw.workPreferences),
		noGos: asNoGos(raw.noGos),
		customNoGos: asStringArray(raw.customNoGos),
	};
}

export function buildSharedProfileParam(profile: UserProfile): string {
	return utf8ToBase64Url(JSON.stringify(compactSharedProfile(profile)));
}

export function parseSharedProfileParam(param: string): UserProfile | null {
	if (!param.trim()) {
		return null;
	}
	try {
		const parsed: unknown = JSON.parse(base64UrlToUtf8(param));
		return expandSharedProfile(parsed);
	} catch {
		return null;
	}
}
