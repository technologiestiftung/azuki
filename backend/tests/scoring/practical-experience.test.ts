import { describe, expect, test } from "vitest";
import { scorePracticalExperience } from "../../src/matching/score/dimensions.js";
import { makeOccupation, makeProfile } from "./helpers.js";

describe("scorePracticalExperience — keyword matching", () => {
	test("returns 0 when no practical experiences are selected", () => {
		const occ = makeOccupation({
			name: "Tischler/in",
			interestKeywords: ["holz", "möbel"],
		});
		const profile = makeProfile({
			practicalExperiences: [
				{
					id: "1",
					description: "Praktikum in der Tischlerei",
					selectedExperienceId: "internship",
					selectedExperienceLabel: "Praktikum",
					rating: 5,
				},
			],
			selectedPracticalExperienceIds: [],
		});

		expect(scorePracticalExperience(occ, profile)).toBe(0);
	});

	test("returns 0 when description does not match occupation metadata", () => {
		const occ = makeOccupation({ interestKeywords: ["software", "system"] });
		const profile = makeProfile({
			practicalExperiences: [
				{
					id: "1",
					description: "Nebenjob im Supermarkt",
					selectedExperienceId: "job",
					selectedExperienceLabel: "Job",
					rating: 5,
				},
			],
			selectedPracticalExperienceIds: ["1"],
		});

		expect(scorePracticalExperience(occ, profile)).toBe(0);
	});

	test("boosts occupations whose metadata overlaps with the description", () => {
		const occ = makeOccupation({
			name: "Fachkraft - Lebensmitteltechnik",
			interestKeywords: ["supermarkt", "verkauf"],
		});
		const profile = makeProfile({
			practicalExperiences: [
				{
					id: "1",
					description: "Nebenjob im Supermarkt",
					selectedExperienceId: "job",
					selectedExperienceLabel: "Job",
					rating: 5,
				},
			],
			selectedPracticalExperienceIds: ["1"],
		});

		expect(scorePracticalExperience(occ, profile)).toBeGreaterThan(0);
	});
});

describe("scorePracticalExperience — category weight", () => {
	const occ = makeOccupation({ interestKeywords: ["supermarkt"] });

	test("internship/job produce a stronger boost than home-help", () => {
		const internshipProfile = makeProfile({
			practicalExperiences: [
				{
					id: "1",
					description: "Praktikum im Supermarkt",
					selectedExperienceId: "internship",
					selectedExperienceLabel: "Praktikum",
					rating: 5,
				},
			],
			selectedPracticalExperienceIds: ["1"],
		});
		const homeProfile = makeProfile({
			practicalExperiences: [
				{
					id: "1",
					description: "Einkaufen im Supermarkt",
					selectedExperienceId: "home-help",
					selectedExperienceLabel: "Zu Hause",
					rating: 5,
				},
			],
			selectedPracticalExperienceIds: ["1"],
		});

		const internshipScore = scorePracticalExperience(occ, internshipProfile);
		const homeScore = scorePracticalExperience(occ, homeProfile);
		expect(internshipScore).toBeGreaterThan(homeScore);
	});
});

describe("scorePracticalExperience — rating multiplier", () => {
	const occ = makeOccupation({ interestKeywords: ["supermarkt"] });

	test("5-star rating produces a larger boost than 2-star", () => {
		const fiveStar = makeProfile({
			practicalExperiences: [
				{
					id: "1",
					description: "Job im Supermarkt",
					selectedExperienceId: "job",
					selectedExperienceLabel: "Job",
					rating: 5,
				},
			],
			selectedPracticalExperienceIds: ["1"],
		});
		const twoStar = makeProfile({
			practicalExperiences: [
				{
					id: "1",
					description: "Job im Supermarkt",
					selectedExperienceId: "job",
					selectedExperienceLabel: "Job",
					rating: 2,
				},
			],
			selectedPracticalExperienceIds: ["1"],
		});

		expect(scorePracticalExperience(occ, fiveStar)).toBeGreaterThan(
			scorePracticalExperience(occ, twoStar),
		);
	});

	test("3-star rating is neutral (no boost)", () => {
		const profile = makeProfile({
			practicalExperiences: [
				{
					id: "1",
					description: "Job im Supermarkt",
					selectedExperienceId: "job",
					selectedExperienceLabel: "Job",
					rating: 3,
				},
			],
			selectedPracticalExperienceIds: ["1"],
		});

		expect(scorePracticalExperience(occ, profile)).toBe(0);
	});
});

describe("scorePracticalExperience — cap", () => {
	test("total contribution is capped at 8 points", () => {
		const occ = makeOccupation({
			interestKeywords: ["supermarkt", "verkauf", "kasse", "regal", "lager"],
		});
		const profile = makeProfile({
			practicalExperiences: [
				{
					id: "1",
					description: "Job im Supermarkt an der Kasse",
					selectedExperienceId: "job",
					selectedExperienceLabel: "Job",
					rating: 5,
				},
				{
					id: "2",
					description: "Praktikum im Supermarkt Lager und Verkauf",
					selectedExperienceId: "internship",
					selectedExperienceLabel: "Praktikum",
					rating: 5,
				},
			],
			selectedPracticalExperienceIds: ["1", "2"],
		});

		expect(scorePracticalExperience(occ, profile)).toBe(8);
	});
});
