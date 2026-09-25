import { reverseGeocode } from "./client";

export interface ResolvedLocation {
	plz: string;
	locality: string | null;
}

/**
 * Thrown for places outside Berlin and Brandenburg. Carries the resolved place
 * so the sheet can name it instead of only saying the lookup was rejected.
 */
export class OutsideServiceAreaError extends Error {
	readonly location: ResolvedLocation;

	constructor(location: ResolvedLocation) {
		super("Location is outside Berlin and Brandenburg");
		this.name = "OutsideServiceAreaError";
		this.location = location;
	}
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

	const location: ResolvedLocation = {
		plz: result.postcode,
		locality: result.locality,
	};

	if (!result.withinServiceArea) {
		throw new OutsideServiceAreaError(location);
	}

	return location;
}
