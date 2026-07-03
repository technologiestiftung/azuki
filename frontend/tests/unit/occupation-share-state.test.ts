import { describe, expect, test } from "vitest";
import {
	buildOccupationShareState,
	buildOccupationShareUrl,
	parseOccupationShareState,
	resolveSharedPills,
} from "../../src/components/results-page/occupation-detail/occupationShareState";

describe("occupationShareState", () => {
	test("round-trips share params", () => {
		const state = {
			fitPercent: 85,
			nextOccupationIds: [101, 202, 303],
			matchingPillKeys: ["handwerk", "technik"],
			notMatchingPillTokens: ["laerm", "custom:L%C3%A4rm"],
		};

		const parsed = parseOccupationShareState(
			new URLSearchParams({
				fit: "85",
				next: "101,202,303",
				m: "handwerk,technik",
				nm: "laerm,custom:L%C3%A4rm",
			}),
		);

		expect(parsed).toEqual(state);
	});

	test("returns null when fit param is missing or invalid", () => {
		expect(parseOccupationShareState(new URLSearchParams())).toBeNull();
		expect(
			parseOccupationShareState(new URLSearchParams({ fit: "abc" })),
		).toBeNull();
		expect(
			parseOccupationShareState(new URLSearchParams({ fit: "150" })),
		).toBeNull();
	});

	test("buildOccupationShareState returns null without fit percent", () => {
		expect(
			buildOccupationShareState(undefined, [1], {
				matching: [],
				notMatching: [],
			}),
		).toBeNull();
	});

	test("buildOccupationShareUrl includes encoded params", () => {
		const url = new URL(
			buildOccupationShareUrl(15164, {
				fitPercent: 72,
				nextOccupationIds: [1, 2],
				matchingPillKeys: ["menschen"],
				notMatchingPillTokens: ["custom:L%C3%A4rm"],
			}),
		);

		expect(url.pathname).toBe("/results/15164");
		expect(url.searchParams.get("fit")).toBe("72");
		expect(url.searchParams.get("next")).toBe("1,2");
		expect(url.searchParams.get("m")).toBe("menschen");
		expect(url.searchParams.get("nm")).toBe("custom:L%C3%A4rm");
	});

	test("resolveSharedPills rebuilds pill metadata", () => {
		const pills = resolveSharedPills({
			fitPercent: 80,
			nextOccupationIds: [],
			matchingPillKeys: ["handwerk"],
			notMatchingPillTokens: ["laerm"],
		});

		expect(pills.matching[0]?.id).toBe("match-handwerk");
		expect(pills.notMatching[0]?.id).toBe("not-match-laerm");
	});
});
