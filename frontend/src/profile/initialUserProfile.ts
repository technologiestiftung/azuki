import type { UserProfile } from "../common";
import { shouldPrefillProfile } from "./prefillConfig";
import { prefillUserProfile } from "./prefillUserProfile";

const emptyUserProfile: UserProfile = {
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
	customNoGos: [],
};

export const initialUserProfile: UserProfile = shouldPrefillProfile
	? prefillUserProfile
	: emptyUserProfile;
