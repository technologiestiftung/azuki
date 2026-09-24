import { describe, expect, it, vi } from "vitest";
import {
	CACHE_MAX_ENTRIES,
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

describe("resolveLocationFromCoordinates caching", () => {
	it("only calls the network once for the same rounded coordinates", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ address: { postcode: "10115", suburb: "Mitte" } }),
		});
		vi.stubGlobal("fetch", fetchMock);

		const first = await resolveLocationFromCoordinates(52.52001, 13.40501);
		const second = await resolveLocationFromCoordinates(52.52002, 13.40499);

		expect(first).toEqual({ postcode: "10115", locality: "Mitte" });
		expect(second).toEqual({ postcode: "10115", locality: "Mitte" });
		expect(fetchMock).toHaveBeenCalledTimes(1);

		vi.unstubAllGlobals();
	});

	it("calls the network again for a different rounded location", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				address: { postcode: "20095", suburb: "Altstadt" },
			}),
		});
		vi.stubGlobal("fetch", fetchMock);

		await resolveLocationFromCoordinates(53.55, 9.99);
		await resolveLocationFromCoordinates(48.13, 11.58);

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
					address: { postcode: "01067", suburb: "Altstadt" },
				}),
			});
		vi.stubGlobal("fetch", fetchMock);

		const first = await resolveLocationFromCoordinates(51.05, 13.74);
		const second = await resolveLocationFromCoordinates(51.05, 13.74);

		expect(first).toBeNull();
		expect(second).toEqual({ postcode: "01067", locality: "Altstadt" });
		expect(fetchMock).toHaveBeenCalledTimes(2);

		vi.unstubAllGlobals();
	});

	it("evicts the oldest entry once the cache is full", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ address: { postcode: "10115", suburb: "Mitte" } }),
		});
		vi.stubGlobal("fetch", fetchMock);

		const coordinate = (i: number): [number, number] => [
			48 + (i % 1000) / 1000,
			7 + Math.floor(i / 1000) / 1000,
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
