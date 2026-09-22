import { describe, expect, test } from "vitest";
import { extractEntrySalarySignal } from "../../../scripts/fetch-berufe.js";

function salaryField(content: string) {
	return [{ id: "b50-0", content }];
}

describe("extractEntrySalarySignal", () => {
	test("takes the low end of a tariff range, not the median", () => {
		const result = extractEntrySalarySignal(
			salaryField(
				"<p>Beispielhafte tarifliche Bruttogrundverg&uuml;tung im Tarifbereich &ouml;ffentlicher Dienst inkl. Zulage im Sozial- und Erziehungsdienst (monatlich): 3.611 &euro; bis 5.180 &euro;</p>",
			),
		);

		expect(result.salaryEntryKnown).toBe(true);
		expect(result.salaryMonthlyEntry).toBe(3611);
	});

	test("keeps a single flat monthly value unchanged", () => {
		const result = extractEntrySalarySignal(
			salaryField(
				"<p>Beispielhafte tarifliche Bruttogrundverg&uuml;tung (monatlich): 3.536 &euro;</p>",
			),
		);

		expect(result.salaryEntryKnown).toBe(true);
		expect(result.salaryMonthlyEntry).toBe(3536);
	});

	test("returns unknown when no euro amounts are present", () => {
		const result = extractEntrySalarySignal(
			salaryField(
				"<p>W&auml;hrend der schulischen Ausbildung erh&auml;lt man keine Verg&uuml;tung.</p>",
			),
		);

		expect(result).toEqual({
			salaryMonthlyEntry: null,
			salaryEntryKnown: false,
		});
	});

	test("excludes per-engagement Wochengage rates instead of extrapolating them to a monthly salary", () => {
		const result = extractEntrySalarySignal(
			salaryField(
				"<p>Beispielhafte tarifliche Mindestwochengage: 1.882 &euro; bis 3.311 &euro;</p>",
			),
		);

		expect(result).toEqual({
			salaryMonthlyEntry: null,
			salaryEntryKnown: false,
		});
	});

	test("keeps an already-monthly Mindestgage figure (only Wochengage is excluded)", () => {
		const result = extractEntrySalarySignal(
			salaryField(
				"<p>Beispielhafte tarifliche Mindestgage (monatlich): 3.220 &euro; Dar&uuml;ber hinausgehende Gagen m&uuml;ssen frei ausgehandelt werden.</p>",
			),
		);

		expect(result.salaryEntryKnown).toBe(true);
		expect(result.salaryMonthlyEntry).toBe(3220);
	});

	test("excludes tariff steps explicitly labeled beyond Stufe 1", () => {
		const result = extractEntrySalarySignal(
			salaryField(
				"<p>Bruttogrundgehaltss&auml;tze (monatlich) in Baden-W&uuml;rttemberg: Besoldungsgruppe A 9, Stufe 4: 3.758 &euro; Bruttogrundgehaltss&auml;tze (monatlich) in Bayern: Besoldungsgruppe A 10, Stufe 4: 3.846 &euro;</p>",
			),
		);

		expect(result).toEqual({
			salaryMonthlyEntry: null,
			salaryEntryKnown: false,
		});
	});

	test("takes the lower of two sector-specific tariff citations", () => {
		const result = extractEntrySalarySignal(
			salaryField(
				"<p>Beispielhafte tarifliche Bruttogrundverg&uuml;tung im Tarifbereich &ouml;ffentlicher Dienst (monatlich): 3.318 &euro; bis 3.785 &euro; Beispielhafte tarifliche Bruttogrundverg&uuml;tung im Bereich der gewerblichen Wirtschaft (monatlich): 3.653 &euro; bis 4.311 &euro;</p>",
			),
		);

		expect(result.salaryEntryKnown).toBe(true);
		expect(result.salaryMonthlyEntry).toBe(3318);
	});
});
