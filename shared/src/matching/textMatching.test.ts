import { describe, expect, test } from "vitest";
import type { Occupation, WorkConditions } from "../types";
import { scoreCustomTextMatch } from "./textMatching";

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

describe("scoreCustomTextMatch", () => {
	test("does not match tieren inside montieren", () => {
		const occupation = makeOccupation({
			taskBullets: ["Heizungen montieren und in Betrieb nehmen"],
		});
		expect(scoreCustomTextMatch("Arbeit mit Tieren", occupation)).toBe(0);
	});

	test("matches prefix compounds like tierhaltung", () => {
		const occupation = makeOccupation({
			skillTags: ["Tierhaltung"],
		});
		expect(scoreCustomTextMatch("Tier", occupation)).toBeGreaterThan(0);
	});

	test("arbeit alone can still hit Arbeitsvorbereitung via prefix", () => {
		// Prefix match can over-hit generic stems like "arbeit".
		const occupation = makeOccupation({
			skillTags: ["Arbeitsvorbereitung"],
		});
		expect(scoreCustomTextMatch("Arbeit", occupation)).toBeGreaterThan(0);
	});
});
