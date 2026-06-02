import { describe, expect, test } from "vitest";
import type { Persona } from "@azuki/shared";
import { getRubricTier } from "../../src/components/eval/tier-lookup";

const baseProfile = {
	inSchool: false,
	educationLevel: "secondary" as const,
	favoriteSubjects: [],
	customSubjects: [],
	interests: [],
	customInterests: [],
	workExpectations: [],
	customWorkExpectations: [],
	strengths: {},
	customStrengths: [],
	selectedCustomStrengths: [],
	practicalExperience: "",
	workPreferences: {},
	noGos: {},
	customNoGos: [],
};

const persona: Persona = {
	id: "p",
	name: "p",
	description: null,
	profile: baseProfile,
	tierS: [1, 2],
	tierA: [10, 11],
	tierC: [100, 101],
	createdAt: "x",
	updatedAt: "x",
};

describe("getRubricTier", () => {
	test("returns S for IDs in tierS", () => {
		expect(getRubricTier(1, persona)).toBe("S");
	});
	test("returns A for IDs in tierA", () => {
		expect(getRubricTier(10, persona)).toBe("A");
	});
	test("returns C for IDs in tierC", () => {
		expect(getRubricTier(100, persona)).toBe("C");
	});
	test("returns undefined for unknown IDs", () => {
		expect(getRubricTier(999, persona)).toBeUndefined();
	});
	test("C wins over S wins over A when ID in multiple tiers", () => {
		const overlapping: Persona = {
			...persona,
			tierS: [42],
			tierA: [42],
			tierC: [42],
		};
		expect(getRubricTier(42, overlapping)).toBe("C");
	});
});
