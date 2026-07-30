import { describe, expect, test } from "vitest";
import type { UserProfile } from "./types";
import {
	buildSharedProfileParam,
	parseSharedProfileParam,
} from "./sharedProfileParams";

const sampleProfile: UserProfile = {
	inSchool: true,
	educationLevel: "intermediate",
	favoriteSubjects: ["math", "biology"],
	customSubjects: ["Astronomie"],
	interests: ["nature"],
	customInterests: [],
	workExpectations: ["money"],
	customWorkExpectations: [],
	strengths: { creativity: 2, teamwork: 1 },
	customStrengths: [],
	selectedCustomStrengths: [],
	practicalExperiences: [
		{
			id: "exp-1",
			description: "Praktikum im Zoo",
			selectedExperienceId: "internship",
			selectedExperienceLabel: "Praktikum",
			rating: 2,
		},
	],
	selectedPracticalExperienceIds: ["exp-1"],
	workPreferences: { environment: "a", people: null },
	noGos: { laerm: "rejected", schmutz: null },
	customNoGos: ["Nachtarbeit"],
};

describe("sharedProfileParams", () => {
	test("roundtrips a profile through the share param", () => {
		const encoded = buildSharedProfileParam(sampleProfile);
		expect(encoded).not.toMatch(/[+/=]/);
		expect(parseSharedProfileParam(encoded)).toEqual(sampleProfile);
	});

	test("returns null for invalid params", () => {
		expect(parseSharedProfileParam("")).toBeNull();
		expect(parseSharedProfileParam("%%%")).toBeNull();
		expect(parseSharedProfileParam(btoa("not-json"))).toBeNull();
	});

	test("fills empty defaults for compact payloads", () => {
		const encoded = buildSharedProfileParam({
			...sampleProfile,
			customSubjects: [],
			customInterests: [],
			customWorkExpectations: [],
			customStrengths: [],
			selectedCustomStrengths: [],
			customNoGos: [],
		});
		const parsed = parseSharedProfileParam(encoded);
		expect(parsed?.favoriteSubjects).toEqual(["math", "biology"]);
		expect(parsed?.customSubjects).toEqual([]);
		expect(parsed?.interests).toEqual(["nature"]);
	});
});
