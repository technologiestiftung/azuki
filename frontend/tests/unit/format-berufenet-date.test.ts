import { describe, expect, test } from "vitest";
import { formatBerufenetDate } from "../../src/components/results-page/utils/formatBerufenetDate";

describe("formatBerufenetDate", () => {
	test("formats an ISO date as MM/YY", () => {
		expect(formatBerufenetDate("2026-09-21")).toBe("09/26");
		expect(formatBerufenetDate("2027-12-01")).toBe("12/27");
	});

	test("defaults to the committed BERUFENET fetch date", () => {
		expect(formatBerufenetDate()).toMatch(/^\d{2}\/\d{2}$/);
	});
});
