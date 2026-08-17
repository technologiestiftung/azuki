import type { UserProfile } from "../common";

/** Demo profile for preview deployments — skips the questionnaire for quick testing. */
export const prefillUserProfile: UserProfile = {
	inSchool: false,
	educationLevel: "intermediate",
	favoriteSubjects: ["math", "english", "sports"],
	customSubjects: [],
	interests: ["computer", "gaming", "music"],
	preferredJobs: ["Fachinformatiker", "Mediengestalter"],
	customInterests: [],
	workExpectations: [
		"good_salary",
		"modern_technology",
		"short_distance",
		"teamwork_value",
	],
	customWorkExpectations: [],
	strengths: {
		teamwork: 1,
		"logical-thinking": 1,
		creativity: 1,
		communication: 1,
		craftsmanship: 0.5,
		concentration: 1,
	},
	customStrengths: [],
	selectedCustomStrengths: [],
	practicalExperiences: [
		{
			id: "prefill-1",
			description: "Ferienjob im Einzelhandel.",
			selectedExperienceId: "job",
			selectedExperienceLabel: "Job",
			rating: 4,
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
