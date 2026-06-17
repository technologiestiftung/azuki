import type { UserProfile } from "../common";

/** Demo profile for preview deployments — skips the questionnaire for quick testing. */
export const prefillUserProfile: UserProfile = {
	inSchool: false,
	educationLevel: "intermediate",
	favoriteSubjects: ["math", "english", "sports"],
	customSubjects: [],
	interests: ["computer", "gaming", "music"],
	customInterests: [],
	workExpectations: [
		"good_salary",
		"modern_technology",
		"short_distance",
		"teamwork_value",
	],
	customWorkExpectations: [],
	strengths: {
		teamwork: 2,
		"logical-thinking": 3,
		creativity: 2,
		communication: 2,
		craftsmanship: 1,
		concentration: 2,
	},
	customStrengths: [],
	selectedCustomStrengths: [],
	practicalExperiences: [
		{
			id: "prefill-1",
			description:
				"Praktikum in einem IT-Unternehmen und Ferienjob im Einzelhandel.",
			selectedExperienceId: null,
			selectedExperienceLabel: null,
			rating: 0,
		},
	],
	selectedPracticalExperienceIds: ["prefill-1"],
	workPreferences: {
		environment: "a",
		location: "a",
		"hands-vs-mind": "b",
		variety: "b",
		pace: "a",
		structure: "b",
		people: "b",
	},
	noGos: {
		"shift-work": "rejected",
		"heavy-work": "rejected",
		dirt: "accepted",
		noise: "accepted",
		computer: "accepted",
		animals: "accepted",
		danger: "accepted",
	},
	customNoGos: [],
};
