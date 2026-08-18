const UNKNOWN_LOCATION = "Unbekannter Ort";

export interface VacancyLocationLike {
	street?: string;
	postcode?: string;
	city?: string;
	district?: string;
	latitude?: number;
	longitude?: number;
}

function hasValue(value: string | undefined): value is string {
	return Boolean(value && value !== "null");
}

export function formatVacancyLocation(location: VacancyLocationLike): string {
	const parts: string[] = [];

	if (hasValue(location.street)) {
		parts.push(location.street);
	}

	const locality: string[] = [];
	if (hasValue(location.postcode)) {
		locality.push(location.postcode);
	}

	const city = hasValue(location.city) ? location.city : undefined;
	if (city && hasValue(location.district)) {
		locality.push(`${city}-${location.district}`);
	} else if (city) {
		locality.push(city);
	}

	if (locality.length > 0) {
		parts.push(locality.join(" "));
	}

	return parts.join(", ") || location.city || UNKNOWN_LOCATION;
}

function hasCoordinates(location: VacancyLocationLike): boolean {
	return (
		typeof location.latitude === "number" &&
		Number.isFinite(location.latitude) &&
		typeof location.longitude === "number" &&
		Number.isFinite(location.longitude)
	);
}

export function buildVacancyMapsUrl(
	location: VacancyLocationLike,
): string | null {
	const label = formatVacancyLocation(location);
	const hasAddress = label && label !== UNKNOWN_LOCATION;

	if (hasAddress) {
		return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`;
	}

	if (hasCoordinates(location)) {
		const query = `${location.latitude},${location.longitude}`;
		return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
	}

	return null;
}
