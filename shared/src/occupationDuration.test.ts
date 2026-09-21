import { describe, expect, it } from "vitest";
import {
	formatOccupationDuration,
	resolveOccupationDuration,
} from "./occupationDuration";
import type { Occupation, WorkConditions } from "./types";

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
		name: "Test",
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
		salaryMonthlyEntry: null,
		salaryEntryKnown: false,
		digitalizationSignal: false,
		workLocations: "",
		competenciesText: "",
		germanOccupationCode: null,
		...rest,
		conditions: makeConditions(conditionOverrides),
	};
}

describe("formatOccupationDuration", () => {
	it("removes i.d.R. and surrounding punctuation", () => {
		expect(formatOccupationDuration("3 Jahre i.d.R.")).toBe("3 Jahre");
		expect(formatOccupationDuration("3 Jahre, i. d. R.")).toBe("3 Jahre");
	});

	it("returns empty for variable Unterschiedlich durations", () => {
		expect(
			formatOccupationDuration(
				"Unterschiedlich, je nach Bildungsanbieter, Unterrichtszeit (Vollzeit/Teilzeit) und Lernform",
			),
		).toBe("");
	});
});

describe("resolveOccupationDuration", () => {
	it("extracts duration from descriptionShort", () => {
		expect(
			resolveOccupationDuration(
				makeOccupation({
					descriptionShort:
						"Ausbildungsart Duale Ausbildung Ausbildungsdauer 3 Jahre Lernorte Betrieb",
				}),
			),
		).toBe("3 Jahre");
	});

	it("returns empty when occupation is missing", () => {
		expect(resolveOccupationDuration(null)).toBe("");
	});
});
