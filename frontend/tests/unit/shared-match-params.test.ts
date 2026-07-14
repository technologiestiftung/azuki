import { describe, expect, test } from "vitest";
import {
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
});
