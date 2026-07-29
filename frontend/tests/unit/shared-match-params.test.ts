import { describe, expect, test } from "vitest";
import {
	MAX_SHARED_OCCUPATIONS,
	buildSharedOccupationsParam,
	parseSharedOccupationsParam,
} from "@azuki/shared";

describe("sharedMatchParams", () => {
	test("builds URL-safe occupation params", () => {
		expect(
			buildSharedOccupationsParam([
				{ id: 7856, fit: 93 },
				{ id: 7847, fit: 83 },
			]),
		).toBe("7856-93_7847-83");
	});

	test("parses compact occupation params", () => {
		expect(parseSharedOccupationsParam("7856-93_7847-83_133560-92")).toEqual([
			{ id: 7856, fit: 93 },
			{ id: 7847, fit: 83 },
			{ id: 133560, fit: 92 },
		]);
	});

	test("still parses legacy colon/comma share links", () => {
		expect(parseSharedOccupationsParam("7856:93,7847:83")).toEqual([
			{ id: 7856, fit: 93 },
			{ id: 7847, fit: 83 },
		]);
	});

	test("caps the number of parsed occupations", () => {
		const oversized = Array.from(
			{ length: MAX_SHARED_OCCUPATIONS + 10 },
			(_, index) => `${1000 + index}-90`,
		).join("_");
		const parsed = parseSharedOccupationsParam(oversized);
		expect(parsed).toHaveLength(MAX_SHARED_OCCUPATIONS);
		expect(parsed[0]).toEqual({ id: 1000, fit: 90 });
		expect(parsed.at(-1)).toEqual({
			id: 1000 + MAX_SHARED_OCCUPATIONS - 1,
			fit: 90,
		});
	});

	test("dedupes repeated occupation ids", () => {
		expect(
			parseSharedOccupationsParam("7856-90_7856-91_7847-83_7856-92"),
		).toEqual([
			{ id: 7856, fit: 90 },
			{ id: 7847, fit: 83 },
		]);
	});
});
