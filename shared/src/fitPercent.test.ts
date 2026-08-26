import { describe, expect, test } from "vitest";
import { fitPercent, fitPercentages, displayFitPercent } from "./fitPercent";

const nonIncreasing = (values: number[]) =>
	values.every((value, i) => i === 0 || value <= values[i - 1]);

function longestRepeat(values: number[]): number {
	let best = 0;
	let run = 0;
	for (let i = 0; i < values.length; i++) {
		run = i > 0 && values[i] === values[i - 1] ? run + 1 : 1;
		best = Math.max(best, run);
	}
	return best;
}

describe("fitPercentages", () => {
	test("leaves an already-ordered list on its true values", () => {
		const scores = [30, 27, 24, 21, 18];
		expect(fitPercentages(scores)).toEqual(scores.map(fitPercent));
	});

	test("touches only the cards that violate the order", () => {
		// 24 sits above 27, so those two pool; the rest keep their true value.
		const result = fitPercentages([30, 24, 27, 20]);
		expect(result[0]).toBe(fitPercent(30));
		expect(result[3]).toBe(fitPercent(20));
		expect(result[1]).toBeGreaterThan(fitPercent(24));
		expect(result[1]).toBeLessThan(fitPercent(27));
	});

	test("a long pooled run steps down instead of collapsing to one number", () => {
		const result = fitPercentages([24, 22, 21, 20, 19, 18, 17, 40]);
		expect(new Set(result).size).toBeGreaterThan(1);
		expect(longestRepeat(result)).toBeLessThanOrEqual(2);
	});

	test("genuinely tied Berufe keep the same true number", () => {
		// Nothing violates the order here, so nothing is invented to separate
		// them — equal scores are allowed to read equal.
		const real = fitPercent(29);
		expect(fitPercentages([29, 29, 29, 29])).toEqual([real, real, real, real]);
	});

	test("never repeats a number more than twice inside a pooled run", () => {
		const result = fitPercentages([
			46, 47, 46.7, 45, 39, 40, 36, 40, 32, 28, 26, 26, 26, 33, 34,
		]);
		expect(longestRepeat(result)).toBeLessThanOrEqual(2);
	});

	test("a weak profile stays weak", () => {
		// Pooling averages, so a list can never read higher than its best card.
		const result = fitPercentages([8, 3, 6, 4, 5, 3]);
		expect(Math.max(...result)).toBeLessThanOrEqual(fitPercent(8));
	});

	test("output is non-increasing for every shape", () => {
		const fixtures = [
			[30, 24, 27, 20],
			[24, 22, 21, 20, 40],
			[46, 47, 46.7, 45, 39, 40, 36, 40, 32, 28, 26, 26, 26, 33, 34],
			[5, 5, 5],
			[-40, 10, -20, 60],
		];
		for (const fixture of fixtures) {
			expect(nonIncreasing(fitPercentages(fixture))).toBe(true);
		}
	});

	test("clamps without going outside 0..100", () => {
		const result = fitPercentages([1000, -1000]);
		expect(Math.min(...result)).toBeGreaterThanOrEqual(0);
		expect(Math.max(...result)).toBeLessThanOrEqual(100);
	});

	test("handles empty and single-card lists", () => {
		expect(fitPercentages([])).toEqual([]);
		expect(fitPercentages([20])).toEqual([fitPercent(20)]);
	});

	test("returns integers", () => {
		for (const value of fitPercentages([30, 24, 27, 20, 26])) {
			expect(Number.isInteger(value)).toBe(true);
		}
	});
});

describe("displayFitPercent", () => {
	test("prefers the stamped list value", () => {
		expect(displayFitPercent({ score: 20, fitPercent: 83 })).toBe(83);
	});

	test("falls back to the single-card curve", () => {
		expect(displayFitPercent({ score: 20 })).toBe(fitPercent(20));
	});
});
