import { describe, expect, test } from "vitest";
import { filterByRegionalAvailability } from "../../src/matching/index.js";
import { makeOccupation } from "../scoring/helpers.js";

/**
 * IDs chosen from shared/data/availability-by-state.json on 2026-05-13:
 *   - 294   has a record, BE+BB total = 0     → must be DROPPED
 *   - 9106  has a record, BE+BB total = 4369  → must be KEPT
 *   - 99999 has NO record                     → must be KEPT (conservative)
 * The deltas to the 5-trainee threshold are large; this test should only
 * fail under a substantive data shift, in which case repick.
 */
describe("filterByRegionalAvailability", () => {
	test("keeps occupations with no availability record", () => {
		const occ = makeOccupation({ id: 99999, name: "Unknown" });
		const result = filterByRegionalAvailability([occ]);
		expect(result).toEqual([occ]);
	});

	test("drops occupations with data but fewer than 5 trainees in BE+BB", () => {
		const occ = makeOccupation({ id: 294, name: "Low-trainee Beruf" });
		const result = filterByRegionalAvailability([occ]);
		expect(result).toEqual([]);
	});

	test("keeps occupations with data above the threshold", () => {
		const occ = makeOccupation({ id: 9106, name: "High-trainee Beruf" });
		const result = filterByRegionalAvailability([occ]);
		expect(result).toEqual([occ]);
	});

	test("filters a mixed list correctly", () => {
		const noData = makeOccupation({ id: 99999, name: "No data" });
		const low = makeOccupation({ id: 294, name: "Low" });
		const high = makeOccupation({ id: 9106, name: "High" });
		const result = filterByRegionalAvailability([noData, low, high]);
		expect(result.map((o) => o.id)).toEqual([99999, 9106]);
	});
});
