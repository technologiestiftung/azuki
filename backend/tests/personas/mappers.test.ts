import { describe, expect, test } from "vitest";
import { rowToPersona } from "../../src/personas/mappers.js";

type Row = Parameters<typeof rowToPersona>[0];

function makeRow(profile: Record<string, unknown>): Row {
	return {
		id: "nico",
		name: "Nico",
		description: null,
		profile,
		tier_s: [],
		tier_a: [],
		tier_c: [],
		created_at: "2025-01-01T00:00:00Z",
		updated_at: "2025-01-01T00:00:00Z",
	} as unknown as Row;
}

describe("rowToPersona", () => {
	test("defaults missing custom array fields so consumers never see undefined", () => {
		const row = makeRow({
			inSchool: false,
			educationLevel: "secondary",
			favoriteSubjects: ["sports"],
			customSubjects: [],
			interests: ["gym"],
			customInterests: [],
			workExpectations: ["good_salary"],
			strengths: { craftsmanship: 1 },
			customStrengths: ["kann gut mit autos"],
			selectedCustomStrengths: ["kann gut mit autos"],
			practicalExperience: "",
			workPreferences: {},
			noGos: {},
			// customNoGos and customWorkExpectations intentionally absent (legacy/seed rows)
		});

		const persona = rowToPersona(row);

		expect(persona.profile.customNoGos).toEqual([]);
		expect(persona.profile.customWorkExpectations).toEqual([]);
	});

	test("preserves populated custom fields", () => {
		const row = makeRow({
			inSchool: false,
			educationLevel: "secondary",
			favoriteSubjects: ["sports"],
			customSubjects: [],
			interests: ["gym"],
			customInterests: [],
			workExpectations: ["good_salary"],
			customWorkExpectations: ["remote"],
			strengths: { craftsmanship: 1 },
			customStrengths: ["kann gut mit autos"],
			selectedCustomStrengths: ["kann gut mit autos"],
			practicalExperience: "",
			workPreferences: {},
			noGos: { "lange Pendeln": "rejected" },
			customNoGos: ["lange Pendeln"],
		});

		const persona = rowToPersona(row);

		expect(persona.profile.customNoGos).toEqual(["lange Pendeln"]);
		expect(persona.profile.customWorkExpectations).toEqual(["remote"]);
		expect(persona.profile.selectedCustomStrengths).toEqual([
			"kann gut mit autos",
		]);
	});
});
