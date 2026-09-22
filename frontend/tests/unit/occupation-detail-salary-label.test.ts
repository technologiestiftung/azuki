import { describe, expect, test } from "vitest";
import type { Occupation } from "@azuki/shared";
import { resolveDetailSalaryLabel } from "../../src/components/results-page/occupation-detail/occupationDetailPageHelpers";

function makeOccupation(overrides: Partial<Occupation> = {}): Occupation {
	return {
		salaryKnown: true,
		salaryMonthlyMedian: 4396,
		salaryEntryKnown: true,
		salaryMonthlyEntry: 3611,
		...overrides,
	} as Occupation;
}

describe("resolveDetailSalaryLabel", () => {
	test("uses the entry-level figure, not the tariff-band median", () => {
		expect(resolveDetailSalaryLabel(makeOccupation())).toBe("3.611 €");
	});

	test("falls back to unknown when the entry-level figure is missing, even if the median is known", () => {
		expect(
			resolveDetailSalaryLabel(
				makeOccupation({ salaryEntryKnown: false, salaryMonthlyEntry: null }),
			),
		).toBe("Unbekannt");
	});
});
