import { describe, expect, test } from "vitest";
import { extractSalarySignal } from "../../../scripts/fetch-berufe.js";

function salaryField(content: string) {
	return [{ id: "b50-0", content }];
}

describe("extractSalarySignal", () => {
	test("normalizes hourly tariff rates to monthly", () => {
		const result = extractSalarySignal(
			salaryField(
				"<p>Beispielhafte tarifliche Bruttogrundverg&uuml;tung (in der Stunde): 26,05 &euro;</p>",
			),
		);

		expect(result.salaryKnown).toBe(true);
		expect(result.salaryMonthlyMedian).toBe(4298);
	});

	test("normalizes hourly ranges via median of band endpoints", () => {
		const result = extractSalarySignal(
			salaryField(
				"<p>Beispielhafte tarifliche Bruttogrundverg&uuml;tung (in der Stunde): 17,37 &euro; bis 19,56 &euro;</p>",
			),
		);

		expect(result.salaryKnown).toBe(true);
		expect(result.salaryMonthlyMedian).toBe(3047);
	});

	test("normalizes weekly Wochengage to monthly", () => {
		const result = extractSalarySignal(
			salaryField(
				"<p>Beispielhafte tarifliche Mindestwochengage: 1.882 &euro; bis 3.311 &euro;</p>",
			),
		);

		expect(result.salaryKnown).toBe(true);
		expect(result.salaryMonthlyMedian).toBe(11243);
	});

	test("keeps monthly tariff amounts unchanged", () => {
		const result = extractSalarySignal(
			salaryField(
				"<p>Beispielhafte tarifliche Bruttogrundverg&uuml;tung (monatlich): 3.497 &euro; bis 3.843 &euro;</p>",
			),
		);

		expect(result.salaryKnown).toBe(true);
		expect(result.salaryMonthlyMedian).toBe(3670);
	});

	test("returns unknown when no euro amounts are present", () => {
		const result = extractSalarySignal(
			salaryField(
				"<p>W&auml;hrend der schulischen Ausbildung erh&auml;lt man keine Verg&uuml;tung.</p>",
			),
		);

		expect(result).toEqual({
			salaryMonthlyMedian: null,
			salaryKnown: false,
		});
	});
});
