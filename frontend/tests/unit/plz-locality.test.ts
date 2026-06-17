import { describe, expect, test } from "vitest";
import {
	formatLocationFilterChipLabel,
	formatPlzWithLocality,
	hasCustomLocationFilter,
} from "../../src/components/filter-bottom-sheet/plzLocality";
import { DEFAULT_LOCATION } from "../../src/store/useAppStore";

describe("formatPlzWithLocality", () => {
	test("appends locality when present", () => {
		expect(formatPlzWithLocality("10115", "Berlin")).toBe("10115 Berlin");
	});

	test("returns postcode only when locality is missing", () => {
		expect(formatPlzWithLocality("10115", null)).toBe("10115");
	});
});

describe("formatLocationFilterChipLabel", () => {
	test("includes km suffix on distance", () => {
		expect(
			formatLocationFilterChipLabel({ postcode: "12347", distance: 50 }),
		).toBe("12347 +50km");
	});
});

describe("hasCustomLocationFilter", () => {
	test("is false for default location without locality", () => {
		expect(
			hasCustomLocationFilter({
				postcode: DEFAULT_LOCATION.postcode,
				distance: DEFAULT_LOCATION.distance,
			}),
		).toBe(false);
	});

	test("is true when locality is set", () => {
		expect(
			hasCustomLocationFilter({
				postcode: "80331",
				distance: DEFAULT_LOCATION.distance,
				locality: "München",
			}),
		).toBe(true);
	});

	test("is true when only distance differs from default (reload without locality)", () => {
		expect(
			hasCustomLocationFilter({
				postcode: "80331",
				distance: 2,
			}),
		).toBe(true);
	});
});
