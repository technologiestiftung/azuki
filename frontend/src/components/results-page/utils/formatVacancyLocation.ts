import type { VacancyPreview } from "@azuki/shared";

const UNKNOWN_LOCATION = "Unbekannter Ort";

function hasValue(value: string | undefined): value is string {
	return Boolean(value && value !== "null");
}

export function formatVacancyLocation(preview: VacancyPreview): string {
	const parts: string[] = [];

	if (hasValue(preview.street)) {
		parts.push(preview.street);
	}

	const locality: string[] = [];
	if (hasValue(preview.postcode)) {
		locality.push(preview.postcode);
	}

	const city = hasValue(preview.city) ? preview.city : undefined;
	if (city && hasValue(preview.district)) {
		locality.push(`${city}-${preview.district}`);
	} else if (city) {
		locality.push(city);
	}

	if (locality.length > 0) {
		parts.push(locality.join(" "));
	}

	return parts.join(", ") || preview.city || UNKNOWN_LOCATION;
}

function hasCoordinates(preview: VacancyPreview): boolean {
	return (
		typeof preview.latitude === "number" &&
		Number.isFinite(preview.latitude) &&
		typeof preview.longitude === "number" &&
		Number.isFinite(preview.longitude)
	);
}

export function buildVacancyMapsUrl(preview: VacancyPreview): string | null {
	if (hasCoordinates(preview)) {
		const query = `${preview.latitude},${preview.longitude}`;
		return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
	}

	const label = formatVacancyLocation(preview);
	if (!label || label === UNKNOWN_LOCATION) {
		return null;
	}

	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`;
}
