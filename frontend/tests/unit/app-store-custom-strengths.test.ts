import { beforeEach, describe, expect, test } from "vitest";
import { useAppStore } from "../../src/store/useAppStore";
import { initialUserProfile } from "../../src/profile/initialUserProfile";

describe("useAppStore — custom strengths", () => {
	beforeEach(() => {
		useAppStore.setState({ profile: initialUserProfile });
	});

	test("addCustomStrength appends to catalog and selection", () => {
		useAppStore.getState().addCustomStrength("Teamarbeit");

		const { profile } = useAppStore.getState();
		expect(profile.customStrengths).toEqual(["Teamarbeit"]);
		expect(profile.selectedCustomStrengths).toEqual(["Teamarbeit"]);
	});

	test("toggleCustomStrength removes only from selection, not catalog", () => {
		useAppStore.getState().addCustomStrength("Teamarbeit");
		useAppStore.getState().toggleCustomStrength("Teamarbeit");

		const { profile } = useAppStore.getState();
		expect(profile.customStrengths).toEqual(["Teamarbeit"]);
		expect(profile.selectedCustomStrengths).toEqual([]);
	});

	test("toggleCustomStrength re-selects a deselected strength", () => {
		useAppStore.getState().addCustomStrength("Teamarbeit");
		useAppStore.getState().toggleCustomStrength("Teamarbeit");
		useAppStore.getState().toggleCustomStrength("Teamarbeit");

		const { profile } = useAppStore.getState();
		expect(profile.selectedCustomStrengths).toEqual(["Teamarbeit"]);
	});

	test("addCustomStrength is a no-op for duplicate catalog entries", () => {
		useAppStore.getState().addCustomStrength("Teamarbeit");
		useAppStore.getState().addCustomStrength("Teamarbeit");

		const { profile } = useAppStore.getState();
		expect(profile.customStrengths).toEqual(["Teamarbeit"]);
		expect(profile.selectedCustomStrengths).toEqual(["Teamarbeit"]);
	});
});
