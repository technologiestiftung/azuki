import { beforeEach, describe, expect, test } from "vitest";
import { useAppStore } from "../../src/store/useAppStore";
import { initialUserProfile } from "../../src/profile/initialUserProfile";

describe("useAppStore — practical experiences", () => {
	beforeEach(() => {
		useAppStore.setState({ profile: initialUserProfile });
	});

	test("addPracticalExperience appends to catalog and selection", () => {
		useAppStore.getState().addPracticalExperience({
			description: "Praktikum in der Tischlerei",
			selectedExperienceId: "internship",
			selectedExperienceLabel: "Praktikum",
			rating: 4,
			tags: ["handwerk"],
		});

		const { profile } = useAppStore.getState();
		expect(profile.practicalExperiences).toHaveLength(1);
		expect(profile.practicalExperiences[0]?.description).toBe(
			"Praktikum in der Tischlerei",
		);
		expect(profile.selectedPracticalExperienceIds).toEqual([
			profile.practicalExperiences[0]?.id,
		]);
	});

	test("togglePracticalExperience removes only from selection, not catalog", () => {
		useAppStore.getState().addPracticalExperience({
			description: "Praktikum in der Tischlerei",
			selectedExperienceId: null,
			selectedExperienceLabel: null,
			rating: 0,
			tags: [],
		});
		const entryId = useAppStore.getState().profile.practicalExperiences[0]?.id;
		useAppStore.getState().togglePracticalExperience(entryId!);

		const { profile } = useAppStore.getState();
		expect(profile.practicalExperiences).toHaveLength(1);
		expect(profile.selectedPracticalExperienceIds).toEqual([]);
	});

	test("togglePracticalExperience re-selects a deselected entry", () => {
		useAppStore.getState().addPracticalExperience({
			description: "Praktikum in der Tischlerei",
			selectedExperienceId: null,
			selectedExperienceLabel: null,
			rating: 0,
			tags: [],
		});
		const entryId = useAppStore.getState().profile.practicalExperiences[0]?.id;
		useAppStore.getState().togglePracticalExperience(entryId!);
		useAppStore.getState().togglePracticalExperience(entryId!);

		const { profile } = useAppStore.getState();
		expect(profile.selectedPracticalExperienceIds).toEqual([entryId]);
	});
});
