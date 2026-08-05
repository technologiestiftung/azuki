import { describe, expect, test } from "vitest";
import type { Occupation, UserProfile, WorkConditions } from "../types";
import { collectMatchSignals } from "./signals";

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

describe("collectMatchSignals", () => {
	test("maps custom no-go text to themed pill via occupation conditions", () => {
		const profile = makeProfile({
			customNoGos: ["Lärm"],
			noGos: { Lärm: "rejected" },
		});
		const occupation = makeOccupation({
			conditions: { noise: true },
		});

		const { notMatching } = collectMatchSignals(profile, occupation);

		expect(notMatching).toHaveLength(1);
		expect(notMatching[0]?.sourceId).toBe("laerm");
		expect(notMatching[0]?.dimension).toBe("noGo");
	});

	test("themed custom no-go does not fuzzy-match unrelated occupation text", () => {
		const profile = makeProfile({
			customNoGos: ["Arbeit mit Tieren"],
			noGos: { "Arbeit mit Tieren": "rejected" },
		});
		const occupation = makeOccupation({
			taskBullets: ["Heizungen montieren und in Betrieb nehmen"],
			conditions: { animalWork: false },
		});

		expect(collectMatchSignals(profile, occupation).notMatching).toHaveLength(
			0,
		);
	});

	test("themed custom animal no-go uses animalWork predicate", () => {
		const profile = makeProfile({
			customNoGos: ["Arbeit mit Tieren"],
			noGos: { "Arbeit mit Tieren": "rejected" },
		});
		const occupation = makeOccupation({
			conditions: { animalWork: true },
		});

		expect(collectMatchSignals(profile, occupation).notMatching).toEqual([
			expect.objectContaining({ sourceId: "tiere", dimension: "noGo" }),
		]);
	});

	test("shift-work no-go uses shiftWork only, not irregularHours", () => {
		const profile = makeProfile({
			noGos: { "shift-work": "rejected" },
		});
		const occupationIrregularOnly = makeOccupation({
			conditions: { irregularHours: true, shiftWork: false },
		});
		const occupationShift = makeOccupation({
			conditions: { shiftWork: true },
		});

		expect(
			collectMatchSignals(profile, occupationIrregularOnly).notMatching,
		).toHaveLength(0);
		expect(collectMatchSignals(profile, occupationShift).notMatching).toEqual([
			expect.objectContaining({ sourceId: "schichten" }),
		]);
	});

	test("danger no-go uses accidentRisk only, not heights", () => {
		const profile = makeProfile({
			noGos: { danger: "rejected" },
		});
		const occupationHeightsOnly = makeOccupation({
			conditions: { heights: true, accidentRisk: false },
		});
		const occupationDanger = makeOccupation({
			conditions: { accidentRisk: true },
		});

		expect(
			collectMatchSignals(profile, occupationHeightsOnly).notMatching,
		).toHaveLength(0);
		expect(collectMatchSignals(profile, occupationDanger).notMatching).toEqual([
			expect.objectContaining({ sourceId: "gefahr" }),
		]);
	});

	test("adds outdoor mismatch when profile prefers indoors", () => {
		const profile = makeProfile({
			workPreferences: { environment: "a", location: "a" },
		});
		const occupation = makeOccupation({
			conditions: { outdoor: true, indoor: true },
		});

		const { notMatching } = collectMatchSignals(profile, occupation);

		expect(notMatching).toContainEqual(
			expect.objectContaining({
				dimension: "outdoorMismatch",
				sourceId: "natur",
			}),
		);
	});

	test("adds work pref mismatch when opposite preference matches", () => {
		const profile = makeProfile({
			workPreferences: { people: "a" },
		});
		const occupation = makeOccupation({
			conditions: { customerContact: true },
		});

		const { notMatching } = collectMatchSignals(profile, occupation);

		expect(notMatching).toContainEqual(
			expect.objectContaining({
				dimension: "workPrefMismatch",
				sourceId: "people:a",
			}),
		);
	});

	test("adds expectation mismatch when modern_technology lacks real tech", () => {
		const profile = makeProfile({
			workExpectations: ["modern_technology"],
		});
		const occupation = makeOccupation({
			digitalizationSignal: true,
			conditions: { machinery: false, screenWork: false },
		});

		const { matching, notMatching } = collectMatchSignals(profile, occupation);

		expect(matching.some((s) => s.sourceId === "modern_technology")).toBe(
			false,
		);
		expect(notMatching).toContainEqual(
			expect.objectContaining({
				dimension: "expectationMismatch",
				sourceId: "modern_technology",
			}),
		);
	});

	test("does not treat Object.prototype keys as work-expectation checks", () => {
		const profile = makeProfile({
			workExpectations: ["valueOf", "toString", "constructor"],
			customWorkExpectations: ["valueOf", "toString", "constructor"],
		});
		const occupation = makeOccupation();

		expect(() => collectMatchSignals(profile, occupation)).not.toThrow();

		const { matching, notMatching } = collectMatchSignals(profile, occupation);
		expect(
			matching.some(
				(s) =>
					s.dimension === "expectation" &&
					["valueOf", "toString", "constructor"].includes(s.sourceId),
			),
		).toBe(false);
		expect(
			notMatching.filter((s) => s.dimension === "expectationMismatch"),
		).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					sourceId: "valueOf",
					isCustom: true,
				}),
				expect.objectContaining({
					sourceId: "toString",
					isCustom: true,
				}),
				expect.objectContaining({
					sourceId: "constructor",
					isCustom: true,
				}),
			]),
		);
	});

	test("structure preference a matches non-creative occupations", () => {
		const profile = makeProfile({
			workPreferences: { structure: "a" },
		});
		const occupation = makeOccupation({
			conditions: { customerContact: true, indoor: true },
		});

		const { matching } = collectMatchSignals(profile, occupation);

		expect(matching).toContainEqual(
			expect.objectContaining({
				dimension: "workPref",
				sourceId: "structure:a",
			}),
		);
	});

	test("collects favorite subject matches", () => {
		const profile = makeProfile({
			favoriteSubjects: ["biology"],
		});
		const occupation = makeOccupation({
			subjects: ["biology"],
		});

		const { matching } = collectMatchSignals(profile, occupation);

		expect(matching).toContainEqual(
			expect.objectContaining({
				dimension: "subject",
				sourceId: "biology",
				weight: 3,
			}),
		);
	});
});
