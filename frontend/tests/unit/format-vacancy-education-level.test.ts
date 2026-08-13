import { describe, expect, test } from "vitest";
import { formatVacancyEducationLevel } from "../../src/components/results-page/utils/formatVacancyEducationLevel";

describe("formatVacancyEducationLevel", () => {
	test("maps known enum values to display labels", () => {
		expect(formatVacancyEducationLevel("HAUPTSCHULABSCHLUSS")).toBe(
			"Hauptschulabschluss (BBR)",
		);
		expect(
			formatVacancyEducationLevel("MITTLERE_REIFE_MITTLERER_BILDUNGSABSCHLUSS"),
		).toBe("Realschulabschluss (MSA)");
		expect(formatVacancyEducationLevel("FACHHOCHSCHULREIFE")).toBe(
			"Fachabitur",
		);
		expect(formatVacancyEducationLevel("OHNE_ABSCHLUSS")).toBe(
			"Ohne Abschluss",
		);
	});

	test("returns null for NICHT_RELEVANT", () => {
		expect(formatVacancyEducationLevel("NICHT_RELEVANT")).toBeNull();
	});

	test("returns null for an unrecognized value", () => {
		expect(formatVacancyEducationLevel("SOME_NEW_VALUE")).toBeNull();
	});

	test("returns null for null/undefined", () => {
		expect(formatVacancyEducationLevel(null)).toBeNull();
		expect(formatVacancyEducationLevel(undefined)).toBeNull();
	});
});
