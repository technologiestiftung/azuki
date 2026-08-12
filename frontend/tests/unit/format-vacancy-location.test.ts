import { describe, expect, test } from "vitest";
import {
	buildVacancyMapsUrl,
	formatVacancyLocation,
} from "../../src/components/results-page/utils/formatVacancyLocation";

describe("formatVacancyLocation", () => {
	test("combines street, postcode and city", () => {
		expect(
			formatVacancyLocation({
				street: "Musterstraße 12",
				postcode: "10115",
				city: "Berlin",
			}),
		).toBe("Musterstraße 12, 10115 Berlin");
	});

	test("appends the district to the city when present", () => {
		expect(
			formatVacancyLocation({
				postcode: "10115",
				city: "Berlin",
				district: "Mitte",
			}),
		).toBe("10115 Berlin-Mitte");
	});

	test("falls back to city, then to the unknown-location label", () => {
		expect(formatVacancyLocation({ city: "Berlin" })).toBe("Berlin");
		expect(formatVacancyLocation({})).toBe("Unbekannter Ort");
	});

	test("excludes the string 'null' from the assembled parts", () => {
		expect(
			formatVacancyLocation({ city: "Berlin", street: "null" }),
		).toBe("Berlin");
	});

	test("works with a VacancyAddress-shaped object (no district field)", () => {
		expect(
			formatVacancyLocation({
				street: "Wilhelmstr. 50",
				postcode: "52146",
				city: "Würselen",
			}),
		).toBe("Wilhelmstr. 50, 52146 Würselen");
	});
});

describe("buildVacancyMapsUrl", () => {
	test("prefers coordinates when available", () => {
		expect(
			buildVacancyMapsUrl({ latitude: 52.52, longitude: 13.405, city: "Berlin" }),
		).toBe("https://www.google.com/maps/search/?api=1&query=52.52%2C13.405");
	});

	test("falls back to the formatted address label", () => {
		expect(buildVacancyMapsUrl({ postcode: "10115", city: "Berlin" })).toBe(
			"https://www.google.com/maps/search/?api=1&query=10115%20Berlin",
		);
	});

	test("returns null when no location info is available", () => {
		expect(buildVacancyMapsUrl({})).toBeNull();
	});
});
