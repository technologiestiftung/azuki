import { describe, expect, test } from "vitest";
import { formatJobsucheDate } from "../../src/components/results-page/utils/formatJobsucheDate";

describe("formatJobsucheDate", () => {
	test("formats a date as DD.MM.YY", () => {
		expect(formatJobsucheDate(new Date(2026, 9, 1))).toBe("01.10.26");
		expect(formatJobsucheDate(new Date(2027, 11, 31))).toBe("31.12.27");
	});
});
