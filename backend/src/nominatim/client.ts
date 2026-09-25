const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";
const POSTCODE_LENGTH = 5;
const REQUEST_TIMEOUT_MS = 5000;
const COORDINATE_PRECISION = 3;
const CACHE_TTL_MS = 60 * 60 * 1000;
export const CACHE_MAX_ENTRIES = 10_000;

// Coarse bounding box for Germany. Only a cheap guard against pointless
// upstream calls — whether a location is actually inside the served region is
// decided by the federal state below.
const GERMANY_BOUNDS = {
	minLat: 47.2,
	maxLat: 55.1,
	minLon: 5.8,
	maxLon: 15.1,
};

const SERVICE_AREA_STATES = new Set(["Berlin", "Brandenburg"]);

// Postcode ranges covering Berlin and Brandenburg, used only when Nominatim
// omits the state. Deliberately generous: a few ranges spill into neighbouring
// states, which is the harmless direction — wrongly telling someone in
// Brandenburg that they are outside the region is not.
const SERVICE_AREA_POSTCODE_RANGES: ReadonlyArray<readonly [number, number]> = [
	[1900, 1999], // Oberlausitz border
	[3000, 3299], // Cottbus, Spree-Neiße
	[4890, 4949], // Elbe-Elster border
	[10000, 14199], // Berlin
	[14400, 16999], // Brandenburg (Potsdam, Havelland, Uckermark, …)
	[17250, 17399], // Templin, Uckermark border
	[19300, 19399], // Prignitz
];

interface CacheEntry {
	value: ResolvedLocation | null;
	expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function cacheKey(lat: number, lon: number): string {
	return `${lat},${lon}`;
}

interface NominatimAddress {
	postcode?: string;
	city?: string;
	town?: string;
	village?: string;
	municipality?: string;
	suburb?: string;
	neighbourhood?: string;
	quarter?: string;
	city_district?: string;
	state?: string;
}

interface NominatimReverseResponse {
	address?: NominatimAddress;
}

export interface ResolvedLocation {
	postcode: string;
	locality: string | null;
	/** False for places outside Berlin and Brandenburg, which the app does not serve. */
	withinServiceArea: boolean;
}

function extractLocality(address: NominatimAddress): string | null {
	// Prefer the city/town over the district, so the sheet shows "12347 Berlin"
	const candidate =
		address.city ??
		address.town ??
		address.village ??
		address.municipality ??
		address.suburb ??
		address.neighbourhood ??
		address.quarter ??
		address.city_district;

	return candidate?.trim() || null;
}

export function roundCoordinate(value: number): number {
	const factor = 10 ** COORDINATE_PRECISION;
	return Math.round(value * factor) / factor;
}

export function isWithinGermany(latitude: number, longitude: number): boolean {
	return (
		latitude >= GERMANY_BOUNDS.minLat &&
		latitude <= GERMANY_BOUNDS.maxLat &&
		longitude >= GERMANY_BOUNDS.minLon &&
		longitude <= GERMANY_BOUNDS.maxLon
	);
}

export function isServiceAreaState(state: string | undefined): boolean {
	return SERVICE_AREA_STATES.has(state?.trim() ?? "");
}

export function isServiceAreaPostcode(postcode: string): boolean {
	const value = Number.parseInt(postcode, 10);
	if (Number.isNaN(value)) {
		return false;
	}

	return SERVICE_AREA_POSTCODE_RANGES.some(
		([min, max]) => value >= min && value <= max,
	);
}

export function parseNominatimReverseResponse(
	data: NominatimReverseResponse,
): ResolvedLocation | null {
	const postcode = data.address?.postcode?.replace(/\D/g, "").slice(0, 5);
	if (!postcode || postcode.length !== POSTCODE_LENGTH) {
		return null;
	}

	return {
		postcode,
		locality: extractLocality(data.address ?? {}),
		// Nominatim does not always return a state; fall back to the postcode
		// so a real Berlin location is never reported as out of area.
		withinServiceArea: data.address?.state
			? isServiceAreaState(data.address.state)
			: isServiceAreaPostcode(postcode),
	};
}

/** Reverse-geocode coordinates to PLZ and display locality via Nominatim (server-side). */
export async function resolveLocationFromCoordinates(
	latitude: number,
	longitude: number,
): Promise<ResolvedLocation | null> {
	const lat = roundCoordinate(latitude);
	const lon = roundCoordinate(longitude);

	if (!isWithinGermany(lat, lon)) {
		return null;
	}

	const key = cacheKey(lat, lon);
	const cached = cache.get(key);
	if (cached && cached.expiresAt > Date.now()) {
		return cached.value;
	}

	const params = new URLSearchParams({
		lat: String(lat),
		lon: String(lon),
		format: "json",
		addressdetails: "1",
	});

	try {
		const res = await fetch(`${NOMINATIM_REVERSE_URL}?${params.toString()}`, {
			headers: {
				Accept: "application/json",
				"Accept-Language": "de",
				"User-Agent":
					"Azuki/1.0 (https://github.com/technologiestiftung/azuki)",
			},
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
		});

		if (!res.ok) {
			console.error(`Nominatim API error: ${res.status}`);
			return null;
		}

		const data = (await res.json()) as NominatimReverseResponse;
		const result = parseNominatimReverseResponse(data);
		cache.delete(key);
		const oldestKey = cache.keys().next().value;
		if (cache.size >= CACHE_MAX_ENTRIES && oldestKey !== undefined) {
			cache.delete(oldestKey);
		}
		cache.set(key, { value: result, expiresAt: Date.now() + CACHE_TTL_MS });
		return result;
	} catch (err) {
		const reason = err instanceof Error ? err.message : String(err);
		console.error(`Nominatim API error: ${reason}`);
		return null;
	}
}
