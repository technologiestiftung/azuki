import { describe, expect, test } from "vitest";
import { withFitPercentages } from "../../src/ai/index.js";
import { fitPercent } from "@azuki/shared";
import type { MatchResult } from "@azuki/shared";

type Card = MatchResult["occupations"][number];

function occupation(id: number, score: number): Card {
	return {
		id,
		name: `Beruf ${id}`,
		rawName: `Beruf ${id}`,
		score,
		images: [],
		shortDescription: "",
		reasoning: "",
		occupationType: "",
		occupationTag: "beauty-fitness",
		occupationDuration: "",
		occupationEarnings: "",
		salaryKnown: false,
		salaryMonthlyMedian: null,
	};
}

describe("withFitPercentages", () => {
	test("keeps the AI order untouched", () => {
		const input = [30, 24, 27, 20].map((score, i) => occupation(i, score));
		expect(withFitPercentages(input).map((card) => card.id)).toEqual([
			0, 1, 2, 3,
		]);
	});

	test("stamps a percentage that never rises down the list", () => {
		const input = [
			46, 47, 46.7, 45, 39, 40, 36, 40, 32, 28, 26, 26, 26, 33, 34,
		];
		const percentages = withFitPercentages(
			input.map((score, i) => occupation(i, score)),
		).map((card) => card.fitPercent ?? 0);
		expect(percentages).toEqual([...percentages].sort((a, b) => b - a));
	});

	test("leaves an agreeing list on its true values", () => {
		const input = [30, 27, 24].map((score, i) => occupation(i, score));
		expect(withFitPercentages(input).map((card) => card.fitPercent)).toEqual([
			fitPercent(30),
			fitPercent(27),
			fitPercent(24),
		]);
	});

	test("does not mutate its input", () => {
		const input = [occupation(1, 30)];
		withFitPercentages(input);
		expect(input[0].fitPercent).toBeUndefined();
	});
});
