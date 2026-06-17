import { describe, expect, test } from "vitest";
import { resolveOccupationShortDescription } from "@azuki/shared";
import { makeOccupation } from "./scoring/helpers.js";

describe("resolveOccupationShortDescription", () => {
	test("prefers pre-generated shortDescription", () => {
		const occ = makeOccupation({
			shortDescription: "Briefe schreiben und Termine planen.",
			taskSummary:
				"Kauffrau/mann Büromanagement organisiert bürowirtschaftliche Abläufe.",
		});
		expect(resolveOccupationShortDescription(occ)).toBe(
			"Briefe schreiben und Termine planen.",
		);
	});

	test("falls back to taskSummary when shortDescription is missing", () => {
		const occ = makeOccupation({
			taskSummary: "Autos reparieren und Kunden beraten.",
		});
		expect(resolveOccupationShortDescription(occ)).toBe(
			"Autos reparieren und Kunden beraten.",
		);
	});

	test("returns empty string when both fields are absent", () => {
		const occ = makeOccupation({ taskSummary: null });
		expect(resolveOccupationShortDescription(occ)).toBe("");
	});
});
