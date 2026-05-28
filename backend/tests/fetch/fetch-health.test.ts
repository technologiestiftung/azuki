import { describe, expect, test } from "vitest";
import {
	fetchHealthError,
	MAX_FETCH_ERROR_RATE,
} from "../../../scripts/fetch-berufe.js";

describe("fetchHealthError", () => {
	test("healthy run (few errors) returns null", () => {
		// ~1% error rate over a full catalog.
		expect(fetchHealthError(728, 720, 8)).toBeNull();
	});

	test("zero ids is fatal — the id-list phase produced nothing", () => {
		expect(fetchHealthError(0, 0, 0)).toMatch(/no occupation IDs/i);
	});

	test("error rate above the limit aborts", () => {
		// 100/728 ≈ 13.7% > 10%.
		const msg = fetchHealthError(728, 600, 100);
		expect(msg).toMatch(/detail fetches failed/i);
	});

	test("error rate exactly at the limit passes (strictly-greater trips)", () => {
		expect(fetchHealthError(100, 90, 10, MAX_FETCH_ERROR_RATE)).toBeNull();
	});

	test("respects a custom maxErrorRate", () => {
		expect(fetchHealthError(100, 95, 5, 0.01)).toMatch(/detail fetches failed/i);
	});
});
