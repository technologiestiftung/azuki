const PLZ_REGEX = /^\d{5}$/;

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
	plz: string;
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

/** Reverse-geocode coordinates to PLZ and a display locality via OpenStreetMap Nominatim. */
export async function resolveLocationFromCoordinates(
	latitude: number,
	longitude: number,
): Promise<ResolvedLocation | null> {
	const params = new URLSearchParams({
		lat: String(latitude),
		lon: String(longitude),
		format: "json",
		addressdetails: "1",
	});

	const res = await fetch(
		`https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
		{
			headers: {
				Accept: "application/json",
				"Accept-Language": "de",
				"User-Agent": "Azuki/1.0 (https://github.com/citylab/azuki)",
			},
		},
	);

	if (!res.ok) {
		return null;
	}

	const data = (await res.json()) as NominatimReverseResponse;
	const postcode = data.address?.postcode?.replace(/\D/g, "").slice(0, 5);
	if (!postcode || !PLZ_REGEX.test(postcode)) {
		return null;
	}

	return {
		plz: postcode,
		locality: extractLocality(data.address ?? {}),
	};
}
