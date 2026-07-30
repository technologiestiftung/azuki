import { describe, expect, test } from "vitest";
import {
	buildOccupationShareState,
	buildOccupationShareUrl,
	parseOccupationShareState,
} from "../../src/components/results-page/occupation-detail/occupationShareState";

describe("occupationShareState", () => {
	test("round-trips share params", () => {
		const state = {
			fitPercent: 85,
			nextOccupationIds: [101, 202, 303],
		};

		const parsed = parseOccupationShareState(
			new URLSearchParams({
				fit: "85",
				next: "101,202,303",
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
		expect(buildOccupationShareState(undefined, [1])).toBeNull();
	});

	test("buildOccupationShareUrl includes encoded params", () => {
		const url = new URL(
			buildOccupationShareUrl(15164, {
				fitPercent: 72,
				nextOccupationIds: [1, 2],
			}),
		);

		expect(url.pathname).toBe("/results/15164");
		expect(url.searchParams.get("fit")).toBe("72");
		expect(url.searchParams.get("next")).toBe("1,2");
		expect(url.searchParams.get("m")).toBeNull();
		expect(url.searchParams.get("nm")).toBeNull();
	});

	test("ignores legacy pill params in shared URLs", () => {
		const parsed = parseOccupationShareState(
			new URLSearchParams({
				fit: "80",
				next: "1",
				m: "handwerk,technik",
				nm: "laerm",
			}),
		);

		expect(parsed).toEqual({
			fitPercent: 80,
			nextOccupationIds: [1],
		});
	});
});
