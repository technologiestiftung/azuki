import { describe, expect, it } from "vitest";
import {
	isWithinGermany,
	parseNominatimReverseResponse,
	roundCoordinate,
} from "../../src/nominatim/client.js";

describe("roundCoordinate", () => {
	it("rounds to three decimal places", () => {
		expect(roundCoordinate(52.5200067)).toBe(52.52);
	});
});

describe("isWithinGermany", () => {
	it("accepts Berlin", () => {
		expect(isWithinGermany(52.52, 13.405)).toBe(true);
	});

	it("rejects coordinates outside Germany", () => {
		expect(isWithinGermany(48.8566, 2.3522)).toBe(false);
	});
});

describe("parseNominatimReverseResponse", () => {
	it("extracts postcode and locality", () => {
		expect(
			parseNominatimReverseResponse({
				address: {
					postcode: "10115",
					suburb: "Mitte",
				},
			}),
		).toEqual({ postcode: "10115", locality: "Mitte" });
	});

	it("returns null when postcode is missing or invalid", () => {
		expect(parseNominatimReverseResponse({ address: {} })).toBeNull();
		expect(
			parseNominatimReverseResponse({ address: { postcode: "ABC" } }),
		).toBeNull();
	});
});
