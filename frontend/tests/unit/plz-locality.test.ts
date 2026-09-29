import { describe, expect, test } from "vitest";
import {
	formatLocationFilterChipLabel,
	formatPlzWithLocality,
	getSelectedLocationDisplay,
	hasCustomLocationFilter,
	hasSpecificLocation,
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

	test("is true when the location was user-selected", () => {
		expect(
			hasCustomLocationFilter({
				postcode: DEFAULT_LOCATION.postcode,
				distance: DEFAULT_LOCATION.distance,
				isUserSelected: true,
			}),
		).toBe(true);
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

describe("hasSpecificLocation", () => {
	test("follows the flag even for the default postcode without locality", () => {
		expect(
			hasSpecificLocation({
				postcode: DEFAULT_LOCATION.postcode,
				locality: null,
				isUserSelected: true,
			}),
		).toBe(true);
	});

	test("is false when the flag says the region default is active", () => {
		expect(
			hasSpecificLocation({
				postcode: "12347",
				locality: "Berlin",
				isUserSelected: false,
			}),
		).toBe(false);
	});

	test("falls back to locality and postcode for state persisted without the flag", () => {
		expect(
			hasSpecificLocation({
				postcode: DEFAULT_LOCATION.postcode,
				locality: "Berlin",
			}),
		).toBe(true);
		expect(hasSpecificLocation({ postcode: "12347" })).toBe(true);
		expect(
			hasSpecificLocation({
				postcode: DEFAULT_LOCATION.postcode,
				locality: null,
			}),
		).toBe(false);
	});
});

describe("getSelectedLocationDisplay", () => {
	test("shows the resolved place instead of the region label", () => {
		expect(
			getSelectedLocationDisplay({
				postcode: "12347",
				regionLabel: "Berlin und Brandenburg",
				useSpecificLocation: true,
				locality: "Berlin",
			}),
		).toBe("12347 Berlin");
	});

	test("shows the region label when no location was selected", () => {
		expect(
			getSelectedLocationDisplay({
				postcode: DEFAULT_LOCATION.postcode,
				regionLabel: "Berlin und Brandenburg",
				useSpecificLocation: false,
			}),
		).toBe("Berlin und Brandenburg");
	});
});
