import { describe, expect, test } from "vitest";
import { normName } from "../../../scripts/normName.js";

describe("normName — frozen verbatim behavior", () => {
	const cases: Array<[string, string]> = [
		// empty / whitespace
		["", ""],
		["   ", ""],
		// lowercase + whitespace collapse
		["  Tischler  ", "tischler"],
		["Tischler\tHolz", "tischlerholz"],
		// ascii-extended preserved, punctuation stripped
		["Bäcker", "bäcker"],
		["Bäcker!", "bäcker"],
		["Maler/Lackierer", "malerlackierer"],
		// bracketed suffixes removed
		["Tischler (Holz)", "tischler"],
		["Kaufmann (Industrie)", "kaufmann"],
		// gender form collapsing — Kaufmann/-frau → kaufmann
		["Kaufmann/-frau", "kaufmann"],
		["Kaufmann/Kauffrau", "kaufmann"],
		["Fachmann/Fachfrau", "fachmann"],
		// /-in stripping
		["Maler/-in", "maler"],
		["Tischler/-r", "tischler"],
		// joining particles dropped
		["Fachkraft für Lagerlogistik", "fachkraftlagerlogistik"],
		["Mitarbeiter im Vertrieb", "mitarbeitervertrieb"],
		[
			"Anlagenmechaniker für Sanitär- und Heiztechnik",
			"anlagenmechanikersanitärheiztechnik",
		],
	];

	for (const [input, expected] of cases) {
		test(`"${input}" → "${expected}"`, () => {
			expect(normName(input)).toBe(expected);
		});
	}
});
