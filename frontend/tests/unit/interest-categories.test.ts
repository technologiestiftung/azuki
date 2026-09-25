import { describe, expect, test } from "vitest";
import { interests } from "../../src/components/competence-profile/steps/interests-step/interests";
import { content } from "../../src/content";

const labelsOf = (categoryName: string) =>
	interests
		.find((category) => category.name === categoryName)
		?.interests.map((interest) => interest.label);

describe("interest categories", () => {
	test("category names use 'und' instead of '&'", () => {
		for (const category of interests) {
			expect(category.name).not.toContain("&");
		}
	});

	test("nature category offers Gärtnern, Mit Tieren sein, Draußen sein in that order", () => {
		expect(labelsOf("Natur, Tiere und Draußen")).toEqual([
			"Gärtnern",
			"Mit Tieren sein",
			"Draußen sein",
		]);
	});

	test("people category offers Anderen helfen, Mit Kindern sein, Lesen, Events planen in that order", () => {
		expect(labelsOf("Menschen und Alltag")).toEqual([
			"Anderen helfen",
			"Mit Kindern sein",
			"Lesen",
			"Events planen",
		]);
	});

	test("Mode and Styling are separate pills, each followed by its partner", () => {
		const labels = labelsOf("Kreatives und Gestalten") ?? [];
		expect(labels.slice(-2)).toEqual(["Mode", "Styling"]);
	});

	test("Reparieren directly follows Schrauben and Gärtnern left the practical category", () => {
		const labels = labelsOf("Handwerk und Praktisches") ?? [];
		expect(labels[labels.indexOf("Schrauben") + 1]).toBe("Reparieren");
		expect(labels).not.toContain("Gärtnern");
	});

	test("school subject Ethik und Religion is written without '&'", () => {
		expect(content["schoolSubjects.society.ethicsReligion.label"]).toBe(
			"Ethik und Religion",
		);
	});
});
