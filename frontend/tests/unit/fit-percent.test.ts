import { describe, expect, test } from "vitest";
import { fitPercent } from "../../src/components/results-page/utils/fitPercent";

describe("fitPercent", () => {
	test("maps calibration anchor raw scores to expected percentages", () => {
		// Logistic curve 100/(1+e^(-0.105*(raw-9))), tuned against eval personas.
		const anchors: Array<[number, number]> = [
			[-20, 5],
			[0, 28],
			[8, 47],
			[15, 65],
			[22, 80],
			[30, 90],
			[40, 96],
		];
		for (const [raw, expected] of anchors) {
			expect(fitPercent(raw)).toBeGreaterThanOrEqual(expected - 1);
			expect(fitPercent(raw)).toBeLessThanOrEqual(expected + 1);
		}
	});

	test("is strictly monotonic across the realistic raw range", () => {
		let prev = -Infinity;
		for (let raw = -60; raw <= 80; raw += 1) {
			const value = fitPercent(raw);
			expect(value).toBeGreaterThanOrEqual(prev);
			prev = value;
		}
	});

	test("clamps to the [0, 100] range at the extremes", () => {
		expect(fitPercent(-1000)).toBeGreaterThanOrEqual(0);
		expect(fitPercent(-1000)).toBeLessThanOrEqual(2);
		expect(fitPercent(1000)).toBeLessThanOrEqual(100);
		expect(fitPercent(1000)).toBeGreaterThanOrEqual(98);
	});

	test("returns an integer", () => {
		for (const raw of [-37, -3, 0, 7, 13, 19, 26, 41]) {
			expect(Number.isInteger(fitPercent(raw))).toBe(true);
		}
	});
});
