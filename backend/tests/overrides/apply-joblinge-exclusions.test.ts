import { describe, expect, test } from "vitest";
import { applyJoblingeExclusions } from "../../../scripts/apply-joblinge-exclusions.js";
import { makeOccupation } from "../scoring/helpers.js";

describe("applyJoblingeExclusions", () => {
	test("removes §66 / §42r Reha jobs by name pattern (Rule A)", () => {
		const input = [
			makeOccupation({ id: 1, name: "Schmuckwerker/in (§66 BBiG/§42r HwO)" }),
			makeOccupation({
				id: 2,
				name: "Fachpraktiker/in für Maler und Lackierer (§66 BBiG/§42r HwO)",
			}),
			makeOccupation({ id: 3, name: "Chemielaborjungwerker/in" }),
		];
		const { occupations, removed } = applyJoblingeExclusions(input);
		expect(occupations.map((o) => o.id)).toEqual([3]); // non-§66 name → Rule A regex must not match it
		expect(removed.map((r) => r.id).sort()).toEqual([1, 2]);
		expect(removed.every((r) => r.reason === "section66")).toBe(true);
	});

	test("removes ids listed in joblinge-exclusions.json (Rule B)", () => {
		// 13952 = Amtliche/r Fachassistent/in (Fleischkontrolleur/in), reason not_suitable.
		const input = [
			makeOccupation({
				id: 13952,
				name: "Amtliche/r Fachassistent/in (Fleischkontrolleur/in)",
			}),
			makeOccupation({ id: 999999, name: "Nicht in der Liste" }),
		];
		const { occupations, removed } = applyJoblingeExclusions(input);
		expect(occupations.map((o) => o.id)).toEqual([999999]);
		expect(removed.map((r) => r.id)).toEqual([13952]);
		expect(removed[0].reason).toBe("not_suitable");
	});

	test("does not mutate the input array", () => {
		const input = [
			makeOccupation({ id: 1, name: "Schmuckwerker/in (§66 BBiG/§42r HwO)" }),
		];
		applyJoblingeExclusions(input);
		expect(input).toHaveLength(1);
	});

	test("reports exclusion ids that matched nothing in the catalog", () => {
		const { unmatchedExclusionIds } = applyJoblingeExclusions([
			makeOccupation({ id: 13952, name: "Amtliche/r Fachassistent/in" }),
		]);
		expect(unmatchedExclusionIds).not.toContain(13952);
		expect(unmatchedExclusionIds.length).toBeGreaterThan(0);
	});

	test("an exclusion id present in the catalog is not reported as unmatched", () => {
		const { unmatchedExclusionIds, removed } = applyJoblingeExclusions([
			makeOccupation({ id: 13952, name: "Amtliche/r Fachassistent/in" }),
			makeOccupation({ id: 999999, name: "Nicht in der Liste" }),
		]);
		expect(removed.map((r) => r.id)).toEqual([13952]);
		expect(unmatchedExclusionIds).not.toContain(13952);
	});
});
