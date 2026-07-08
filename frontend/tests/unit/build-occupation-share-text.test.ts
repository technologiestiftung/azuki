import { describe, expect, test } from "vitest";
import { buildOccupationShareText } from "../../src/components/results-page/occupation-detail/buildOccupationShareText";
import type { Occupation } from "@azuki/shared";

function makeOccupation(overrides: Partial<Occupation> = {}): Occupation {
	return {
		id: 1,
		name: "Anlagenmechaniker/in",
		salaryKnown: true,
		salaryMonthlyMedian: 2800,
		...overrides,
	} as Occupation;
}

describe("buildOccupationShareText", () => {
	test("formats duration and salary", () => {
		expect(buildOccupationShareText(makeOccupation(), "2-4 Jahre")).toBe(
			"Dauer: 2-4 Jahre · Einstiegsgehalt: 2.800 €",
		);
	});

	test("omits duration when empty", () => {
		expect(buildOccupationShareText(makeOccupation(), "")).toBe(
			"Einstiegsgehalt: 2.800 €",
		);
	});

	test("uses unknown salary label when salary is missing", () => {
		expect(
			buildOccupationShareText(
				makeOccupation({
					salaryKnown: false,
					salaryMonthlyMedian: null,
				}),
				"3 Jahre",
			),
		).toBe("Dauer: 3 Jahre · Einstiegsgehalt: Unbekannt");
	});
});
