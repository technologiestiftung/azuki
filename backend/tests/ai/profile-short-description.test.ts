import { describe, expect, test } from "vitest";
import {
	formatProfileForShortDescription,
	normalizeProfileShortDescription,
	PROFILE_SHORT_DESCRIPTION_FALLBACK,
} from "../../src/ai/profileShortDescription.js";

describe("normalizeProfileShortDescription", () => {
	test("returns trimmed plain sentence", () => {
		expect(
			normalizeProfileShortDescription(
				"  Natur und Pflanzen sind deine Welt.  ",
			),
		).toBe("Natur und Pflanzen sind deine Welt.");
	});

	test("strips wrapping quotes", () => {
		expect(
			normalizeProfileShortDescription('"Du entdeckst gerne Neues."'),
		).toBe("Du entdeckst gerne Neues.");
		expect(normalizeProfileShortDescription("„Technik fasziniert dich.“")).toBe(
			"Technik fasziniert dich.",
		);
	});

	test("strips markdown fences", () => {
		expect(
			normalizeProfileShortDescription(
				"```\nDu magst den Umgang mit Tieren.\n```",
			),
		).toBe("Du magst den Umgang mit Tieren.");
	});

	test("parses JSON wrapper if present", () => {
		expect(
			normalizeProfileShortDescription(
				'{"shortDescription":"Kreativität ist deine Stärke."}',
			),
		).toBe("Kreativität ist deine Stärke.");
	});

	test("takes first line only", () => {
		expect(
			normalizeProfileShortDescription(
				"Du bist stark im Team.\nErklärung: weil Interessen X",
			),
		).toBe("Du bist stark im Team.");
	});

	test("caps at 60 characters without cutting mid-word when possible", () => {
		const long =
			"Du liebst Natur Pflanzen Tiere und alles was draußen wächst und blüht wirklich sehr.";
		const result = normalizeProfileShortDescription(long);
		expect(result).toEqual(expect.any(String));
		expect(result?.length).toBeLessThanOrEqual(60);
		expect(result).not.toMatch(/\s$/);
	});

	test("returns null for empty input", () => {
		expect(normalizeProfileShortDescription("")).toBeNull();
		expect(normalizeProfileShortDescription("   ")).toBeNull();
	});
});

describe("formatProfileForShortDescription", () => {
	test("includes interests, strengths, subjects and custom freitext only", () => {
		const text = formatProfileForShortDescription({
			inSchool: true,
			educationLevel: "intermediate",
			favoriteSubjects: ["biology", "custom-bio"],
			customSubjects: ["custom-bio"],
			interests: ["animals", "my-hobby"],
			customInterests: ["my-hobby"],
			strengths: { teamwork: 1, math: 0.2 },
			customStrengths: ["Geduld"],
			selectedCustomStrengths: ["Geduld"],
			workExpectations: ["good_pay"],
			customWorkExpectations: [],
			practicalExperiences: [],
			selectedPracticalExperienceIds: [],
			workPreferences: { indoor_outdoor: "a" },
			noGos: { laerm: "rejected" },
			customNoGos: [],
			preferredJobs: [],
		});

		expect(text).toContain("Lieblingsfächer");
		expect(text).toContain("Biologie");
		expect(text).toContain("custom-bio");
		expect(text).toContain("Interessen");
		expect(text).toContain("my-hobby");
		expect(text).toContain("Stärken");
		expect(text).toContain("Geduld");
		expect(text).not.toContain("No-Gos");
		expect(text).not.toContain("Lärm");
		expect(text).not.toContain("Eher nicht so gut");
		expect(text).not.toContain("Arbeitsvorlieben");
		expect(text).not.toContain("Schulabschluss");
		expect(text).not.toContain("Rahmenbedingungen");
	});

	test("returns placeholder when profile slice is empty", () => {
		expect(
			formatProfileForShortDescription({
				inSchool: null,
				educationLevel: null,
				favoriteSubjects: [],
				customSubjects: [],
				interests: [],
				customInterests: [],
				strengths: {},
				customStrengths: [],
				selectedCustomStrengths: [],
				workExpectations: [],
				customWorkExpectations: [],
				practicalExperiences: [],
				selectedPracticalExperienceIds: [],
				workPreferences: {},
				noGos: {},
				customNoGos: [],
				preferredJobs: [],
			}),
		).toBe("(keine Angaben)");
	});
});

describe("PROFILE_SHORT_DESCRIPTION_FALLBACK", () => {
	test("is empty so the UI can hide the subline", () => {
		expect(PROFILE_SHORT_DESCRIPTION_FALLBACK).toBe("");
	});
});
