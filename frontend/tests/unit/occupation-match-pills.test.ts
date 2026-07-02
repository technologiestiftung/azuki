import { describe, expect, test } from "vitest";
import type { Occupation, UserProfile, WorkConditions } from "@azuki/shared";
import { buildOccupationMatchPills } from "../../src/components/results-page/utils/occupationMatchPills";

function makeConditions(
	overrides: Partial<WorkConditions> = {},
): WorkConditions {
	return {
		outdoor: false,
		office: false,
		workshop: false,
		indoor: false,
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

function makeOccupation(
	overrides: Partial<Omit<Occupation, "conditions">> & {
		conditions?: Partial<WorkConditions>;
	} = {},
): Occupation {
	const { conditions: conditionOverrides, ...rest } = overrides;
	return {
		id: 1,
		name: "Test Beruf",
		descriptionShort: null,
		descriptionLong: null,
		taskSummary: null,
		images: [],
		degreeStats: null,
		accessLevel: null,
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
		germanOccupationCode: null,
		...rest,
		conditions: makeConditions(conditionOverrides),
	};
}

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
	return {
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
		...overrides,
	};
}

describe("buildOccupationMatchPills", () => {
	test("maps custom no-go text to themed pill via occupation conditions", () => {
		const profile = makeProfile({
			customNoGos: ["Lärm"],
			noGos: { Lärm: "rejected" },
		});
		const occupation = makeOccupation({
			conditions: { noise: true },
		});

		const { notMatching } = buildOccupationMatchPills(profile, occupation);

		expect(notMatching).toHaveLength(1);
		expect(notMatching[0]?.id).toBe("not-match-laerm");
	});

	test("dedupes overlapping not-match pills by id", () => {
		const profile = makeProfile({
			noGos: { noise: "rejected" },
			workPreferences: { environment: "a", location: "a" },
		});
		const occupation = makeOccupation({
			conditions: { noise: true, outdoor: true, indoor: true },
		});

		const { notMatching } = buildOccupationMatchPills(profile, occupation);

		expect(
			notMatching.filter((pill) => pill.id === "not-match-laerm"),
		).toHaveLength(1);
		expect(
			notMatching.filter((pill) => pill.id === "not-match-natur"),
		).toHaveLength(1);
	});

	test("limits each group to five pills", () => {
		const profile = makeProfile({
			interests: [
				"gaming",
				"computer",
				"drawing",
				"music",
				"crafting",
				"gardening",
				"animals",
			],
			strengths: {
				teamwork: 3,
				creativity: 3,
				communication: 3,
			},
			favoriteSubjects: ["biology", "math", "physics", "art", "sports"],
		});
		const occupation = makeOccupation({
			interests: ["kreativ-gestaltend", "natur-umwelt"],
			subjects: ["biology", "math", "physics", "art", "sports"],
			strengthTags: [
				"Befähigung zu Gruppenarbeit / Teamfähigkeit",
				"Kreativität",
				"Kommunikationsfähigkeit",
			],
			conditions: {
				outdoor: true,
				customerContact: true,
				teamwork: true,
				changingTasks: true,
				screenWork: true,
			},
		});

		const { matching } = buildOccupationMatchPills(profile, occupation);

		expect(matching).toHaveLength(5);
	});

	test("shows aufgaben pill for structure preference a on non-creative occupations", () => {
		const profile = makeProfile({
			workPreferences: { structure: "a" },
		});
		const occupation = makeOccupation({
			conditions: { customerContact: true, indoor: true },
		});

		const { matching } = buildOccupationMatchPills(profile, occupation);

		expect(matching.some((pill) => pill.id === "match-aufgaben")).toBe(true);
	});
});
