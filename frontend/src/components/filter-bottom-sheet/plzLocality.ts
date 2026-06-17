import { DEFAULT_LOCATION } from "../../store/useAppStore";

export function formatPlzWithLocality(
	plz: string,
	locality?: string | null,
): string {
	const label = locality?.trim();
	return label ? `${plz} ${label}` : plz;
}

export function getSelectedLocationDisplay({
	postcode,
	regionLabel,
	useSpecificLocation,
	locality,
}: {
	postcode: string;
	regionLabel: string;
	useSpecificLocation: boolean;
	locality?: string | null;
}): string {
	if (useSpecificLocation) {
		return formatPlzWithLocality(postcode, locality);
	}

	return regionLabel;
}

export function formatLocationFilterChipLabel({
	postcode,
	distance,
}: {
	postcode: string;
	distance: number;
}): string {
	return `${postcode} +${distance}km`;
}

export function hasCustomLocationFilter(applied: {
	postcode: string;
	distance: number;
	locality?: string | null;
}): boolean {
	return (
		Boolean(applied.locality?.trim()) ||
		applied.postcode !== DEFAULT_LOCATION.postcode ||
		applied.distance !== DEFAULT_LOCATION.distance
	);
}
