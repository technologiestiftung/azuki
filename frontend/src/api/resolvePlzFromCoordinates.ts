import { reverseGeocode } from "./client";

export interface ResolvedLocation {
	plz: string;
	locality: string | null;
}

/** Reverse-geocode coordinates to PLZ and a display locality via the backend proxy. */
export async function resolveLocationFromCoordinates(
	latitude: number,
	longitude: number,
): Promise<ResolvedLocation | null> {
	const result = await reverseGeocode(latitude, longitude);
	if (!result) {
		return null;
	}

	return {
		plz: result.postcode,
		locality: result.locality,
	};
}
