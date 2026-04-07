import type { Occupation, UserProfile, WorkConditions } from "@azuki/shared";

export function makeConditions(
	overrides: Partial<WorkConditions> = {},
): WorkConditions {
	return {
		outdoor: false,
		office: false,
		workshop: false,
		constructionSite: false,
		screenWork: false,
		manualLabor: false,
		machinery: false,
		noise: false,
		dirt: false,
		heavyLifting: false,
		heights: false,
		shiftWork: false,
		customerContact: false,
		teamwork: false,
		standingWalking: false,
		irregularHours: false,
		changingTasks: false,
		regulatedWork: false,
		animalWork: false,
		accidentRisk: false,
		precisionWork: false,
		frequentAbsence: false,
		changingWorkplaces: false,
		...overrides,
	};
}

export function makeOccupation(
	overrides: Partial<Omit<Occupation, "conditions">> & {
		conditions?: Partial<WorkConditions>;
	} = {},
): Occupation {
	const { conditions: condOverrides, ...rest } = overrides;
	return {
		id: 1,
		name: "Test Beruf",
		descriptionShort: null,
		descriptionLong: null,
		taskSummary: null,
		images: [],
		degreeStats: null,
		subjects: [],
		interests: [],
		interestKeywords: [],
		strengthTags: [],
		skillTags: [],
		salaryMonthlyMedian: null,
		salaryKnown: false,
		digitalizationSignal: false,
		workLocations: "",
		competenciesText: "",
		...rest,
		conditions: makeConditions(condOverrides),
	};
}

export function makeProfile(
	overrides: Partial<UserProfile> = {},
): UserProfile {
	return {
		inSchool: null,
		educationLevel: null,
		favoriteSubjects: [],
		interests: [],
		customInterests: [],
		workValues: [],
		strengths: {},
		secretTalent: "",
		practicalExperience: "",
		workPreferences: {},
		noGos: {},
		...overrides,
	};
}
