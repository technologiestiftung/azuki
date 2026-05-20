import type { UserProfile } from "../common";

export const initialUserProfile: UserProfile = {
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
	practicalExperience: "",
	workPreferences: {},
	noGos: {},
};

type PersistedProfile = Partial<UserProfile> & {
	secretTalent?: string;
};

function migrateSecretTalent(profile: PersistedProfile): string[] {
	const legacy = profile.secretTalent?.trim();
	if (legacy) {
		return [legacy];
	}
	return profile.customStrengths ?? [];
}

/** Normalizes persisted/partial profiles and migrates legacy `secretTalent`. */
export function normalizeUserProfile(
	profile: Partial<UserProfile> | undefined,
): UserProfile {
	const input: PersistedProfile = profile ?? {};
	const customStrengths = migrateSecretTalent(input);
	const hasSelectedKey = "selectedCustomStrengths" in input;
	const selectedCustomStrengths = hasSelectedKey
		? (input.selectedCustomStrengths ?? [])
		: customStrengths;
	const merged: PersistedProfile = { ...initialUserProfile, ...input };

	return {
		...merged,
		favoriteSubjects: merged.favoriteSubjects ?? [],
		customSubjects: merged.customSubjects ?? [],
		interests: merged.interests ?? [],
		customInterests: merged.customInterests ?? [],
		workExpectations: merged.workExpectations ?? [],
		customWorkExpectations: merged.customWorkExpectations ?? [],
		strengths: merged.strengths ?? {},
		customStrengths,
		selectedCustomStrengths,
		workPreferences: merged.workPreferences ?? {},
		noGos: merged.noGos ?? {},
	};
}
