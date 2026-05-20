import { describe, expect, test } from "vitest";
import { normalizeUserProfile } from "../../src/profile/normalizeUserProfile";

describe("normalizeUserProfile", () => {
	test("migrates legacy secretTalent into customStrengths and selectedCustomStrengths", () => {
		const profile = normalizeUserProfile({
			secretTalent: "  kann gut zuhören  ",
		});

		expect(profile.customStrengths).toEqual(["kann gut zuhören"]);
		expect(profile.selectedCustomStrengths).toEqual(["kann gut zuhören"]);
	});

	test("defaults selectedCustomStrengths to customStrengths when missing", () => {
		const profile = normalizeUserProfile({
			customStrengths: ["organisiert Umzüge"],
		});

		expect(profile.selectedCustomStrengths).toEqual(["organisiert Umzüge"]);
	});

	test("preserves explicit selectedCustomStrengths subset", () => {
		const profile = normalizeUserProfile({
			customStrengths: ["kann gut zuhören", "organisiert Umzüge"],
			selectedCustomStrengths: ["kann gut zuhören"],
		});

		expect(profile.selectedCustomStrengths).toEqual(["kann gut zuhören"]);
	});

	test("empty secretTalent does not create custom strength entries", () => {
		const profile = normalizeUserProfile({
			secretTalent: "   ",
		});

		expect(profile.customStrengths).toEqual([]);
		expect(profile.selectedCustomStrengths).toEqual([]);
	});
});
