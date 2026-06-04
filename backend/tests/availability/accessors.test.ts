import { describe, expect, test } from "vitest";
import {
	hasAvailabilityData,
	traineeCountInState,
	traineeCountAcrossStates,
	BUNDESLAENDER,
} from "@azuki/shared";
import availability from "../../../shared/data/availability-by-state.json";

describe("availability accessors — missing data", () => {
	const MISSING_ID = 999999;

	test("hasAvailabilityData returns false for unknown id", () => {
		expect(hasAvailabilityData(MISSING_ID)).toBe(false);
	});

	test("traineeCountInState returns 0 for unknown id", () => {
		expect(traineeCountInState(MISSING_ID, "Berlin")).toBe(0);
	});

	test("traineeCountAcrossStates returns 0 for unknown id", () => {
		expect(
			traineeCountAcrossStates(MISSING_ID, ["Berlin", "Brandenburg"]),
		).toBe(0);
	});

	test("traineeCountAcrossStates with empty state list returns 0", () => {
		const anyKnownId = Number(Object.keys(availability)[0]);
		expect(traineeCountAcrossStates(anyKnownId, [])).toBe(0);
	});
});

describe("availability accessors — fixture shape", () => {
	test("every id in the fixture is recognized by hasAvailabilityData", () => {
		for (const key of Object.keys(availability)) {
			expect(hasAvailabilityData(Number(key))).toBe(true);
		}
	});

	test("every count is a non-negative integer", () => {
		for (const [, counts] of Object.entries(availability)) {
			for (const [state, n] of Object.entries(
				counts as Record<string, number>,
			)) {
				expect(Number.isInteger(n)).toBe(true);
				expect(n).toBeGreaterThanOrEqual(0);
				expect(typeof state).toBe("string");
			}
		}
	});

	test("traineeCountAcrossStates equals the sum of its per-state parts", () => {
		const id = Number(Object.keys(availability)[0]);
		const states = BUNDESLAENDER;
		const sum = states.reduce((s, st) => s + traineeCountInState(id, st), 0);
		expect(traineeCountAcrossStates(id, states)).toBe(sum);
	});
});
