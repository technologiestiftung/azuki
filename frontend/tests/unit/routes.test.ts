import { describe, expect, test } from "vitest";
import { getPreviousPath, ROUTE_PATHS } from "../../src/routing/routes";

describe("getPreviousPath", () => {
	test("start screen has no previous screen to go back to", () => {
		expect(getPreviousPath(ROUTE_PATHS.start, "")).toBe(ROUTE_PATHS.start);
	});

	test("first questionnaire step goes back to start", () => {
		expect(getPreviousPath(ROUTE_PATHS.educationInSchool, "")).toBe(
			ROUTE_PATHS.start,
		);
	});

	test("path not in the step list falls back to start", () => {
		expect(getPreviousPath("/not-a-step", "")).toBe(ROUTE_PATHS.start);
	});
});
