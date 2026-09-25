import { describe, expect, it, vi } from "vitest";
import {
	CACHE_MAX_ENTRIES,
	isServiceAreaPostcode,
	isServiceAreaState,
	isWithinGermany,
	parseNominatimReverseResponse,
	resolveLocationFromCoordinates,
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

describe("isServiceAreaState", () => {
	it("accepts Berlin and Brandenburg", () => {
		expect(isServiceAreaState("Berlin")).toBe(true);
		expect(isServiceAreaState("Brandenburg")).toBe(true);
	});

	it("rejects other states and a missing state", () => {
		expect(isServiceAreaState("Sachsen")).toBe(false);
		expect(isServiceAreaState(undefined)).toBe(false);
	});
});

describe("isServiceAreaPostcode", () => {
	it("accepts Berlin and Brandenburg postcodes", () => {
		expect(isServiceAreaPostcode("12347")).toBe(true);
		expect(isServiceAreaPostcode("10115")).toBe(true);
		expect(isServiceAreaPostcode("14467")).toBe(true);
		expect(isServiceAreaPostcode("03046")).toBe(true);
	});

	it("rejects postcodes elsewhere in Germany", () => {
		expect(isServiceAreaPostcode("80331")).toBe(false);
		expect(isServiceAreaPostcode("20095")).toBe(false);
		expect(isServiceAreaPostcode("01067")).toBe(false);
	});
});

describe("resolveLocationFromCoordinates service area", () => {
	it("does not call Nominatim for coordinates outside Germany", async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);

		expect(await resolveLocationFromCoordinates(48.8566, 2.3522)).toBeNull();
		expect(fetchMock).not.toHaveBeenCalled();

		vi.unstubAllGlobals();
	});

	it("resolves places outside the service area but marks them", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				address: { postcode: "80331", city: "München", state: "Bayern" },
			}),
		});
		vi.stubGlobal("fetch", fetchMock);

		expect(await resolveLocationFromCoordinates(48.1372, 11.5755)).toEqual({
			postcode: "80331",
			locality: "München",
			withinServiceArea: false,
		});

		vi.unstubAllGlobals();
	});
});

describe("parseNominatimReverseResponse", () => {
	it("prefers the city over the district", () => {
		expect(
			parseNominatimReverseResponse({
				address: {
					postcode: "12347",
					city: "Berlin",
					suburb: "Britz",
					state: "Berlin",
				},
			}),
		).toEqual({
			postcode: "12347",
			locality: "Berlin",
			withinServiceArea: true,
		});
	});

	it("falls back to the district when no city is given", () => {
		expect(
			parseNominatimReverseResponse({
				address: {
					postcode: "10115",
					suburb: "Mitte",
					state: "Berlin",
				},
			}),
		).toEqual({
			postcode: "10115",
			locality: "Mitte",
			withinServiceArea: true,
		});
	});

	it("falls back to the postcode when Nominatim omits the state", () => {
		expect(
			parseNominatimReverseResponse({
				address: { postcode: "12347", city: "Berlin" },
			}),
		).toEqual({
			postcode: "12347",
			locality: "Berlin",
			withinServiceArea: true,
		});

		expect(
			parseNominatimReverseResponse({
				address: { postcode: "80331", city: "München" },
			}),
		).toEqual({
			postcode: "80331",
			locality: "München",
			withinServiceArea: false,
		});
	});

	it("returns null when postcode is missing or invalid", () => {
		expect(parseNominatimReverseResponse({ address: {} })).toBeNull();
		expect(
			parseNominatimReverseResponse({ address: { postcode: "ABC" } }),
		).toBeNull();
	});
});

describe("resolveLocationFromCoordinates caching", () => {
	it("only calls the network once for the same rounded coordinates", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				address: { postcode: "10115", suburb: "Mitte", state: "Berlin" },
			}),
		});
		vi.stubGlobal("fetch", fetchMock);

		const first = await resolveLocationFromCoordinates(52.52001, 13.40501);
		const second = await resolveLocationFromCoordinates(52.52002, 13.40499);

		const mitte = {
			postcode: "10115",
			locality: "Mitte",
			withinServiceArea: true,
		};
		expect(first).toEqual(mitte);
		expect(second).toEqual(mitte);
		expect(fetchMock).toHaveBeenCalledTimes(1);

		vi.unstubAllGlobals();
	});

	it("calls the network again for a different rounded location", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				address: { postcode: "14467", city: "Potsdam", state: "Brandenburg" },
			}),
		});
		vi.stubGlobal("fetch", fetchMock);

		await resolveLocationFromCoordinates(52.4, 13.06);
		await resolveLocationFromCoordinates(52.92, 12.81);

		expect(fetchMock).toHaveBeenCalledTimes(2);

		vi.unstubAllGlobals();
	});

	it("does not cache a failed upstream response", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({ ok: false, status: 503 })
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					address: {
						postcode: "03046",
						city: "Cottbus",
						state: "Brandenburg",
					},
				}),
			});
		vi.stubGlobal("fetch", fetchMock);

		const first = await resolveLocationFromCoordinates(51.76, 14.33);
		const second = await resolveLocationFromCoordinates(51.76, 14.33);

		expect(first).toBeNull();
		expect(second).toEqual({
			postcode: "03046",
			locality: "Cottbus",
			withinServiceArea: true,
		});
		expect(fetchMock).toHaveBeenCalledTimes(2);

		vi.unstubAllGlobals();
	});

	it("evicts the oldest entry once the cache is full", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				address: { postcode: "10115", suburb: "Mitte", state: "Berlin" },
			}),
		});
		vi.stubGlobal("fetch", fetchMock);

		const coordinate = (i: number): [number, number] => [
			52 + (i % 1000) / 1000,
			13 + Math.floor(i / 1000) / 1000,
		];
		for (let i = 0; i <= CACHE_MAX_ENTRIES; i++) {
			await resolveLocationFromCoordinates(...coordinate(i));
		}
		expect(fetchMock).toHaveBeenCalledTimes(CACHE_MAX_ENTRIES + 1);
		fetchMock.mockClear();

		await resolveLocationFromCoordinates(...coordinate(CACHE_MAX_ENTRIES));
		expect(fetchMock).not.toHaveBeenCalled();

		await resolveLocationFromCoordinates(...coordinate(0));
		expect(fetchMock).toHaveBeenCalledTimes(1);

		vi.unstubAllGlobals();
	});
});
