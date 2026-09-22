const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";
const POSTCODE_LENGTH = 5;
const REQUEST_TIMEOUT_MS = 5000;
const COORDINATE_PRECISION = 3;
const CACHE_TTL_MS = 60 * 60 * 1000;

// Rough bounding box for Germany
const GERMANY_BOUNDS = {
	minLat: 47.2,
	maxLat: 55.1,
	minLon: 5.8,
	maxLon: 15.1,
};

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
	suburb?: string;
	neighbourhood?: string;
	quarter?: string;
	city_district?: string;
}

interface NominatimReverseResponse {
	address?: NominatimAddress;
}

export interface ResolvedLocation {
	postcode: string;
	locality: string | null;
}

function extractLocality(address: NominatimAddress): string | null {
	const candidate =
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
		cache.set(key, { value: result, expiresAt: Date.now() + CACHE_TTL_MS });
		return result;
	} catch (err) {
		const reason = err instanceof Error ? err.message : String(err);
		console.error(`Nominatim API error: ${reason}`);
		return null;
	}
}
