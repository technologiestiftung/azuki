import { DEFAULT_LOCATION } from "../../store/useAppStore";

export function formatPlzWithLocality(
	plz: string,
	locality?: string | null,
): string {
	const label = locality?.trim();
	return label ? `${plz} ${label}` : plz;
}

/**
 * Whether the filter holds a place the user picked rather than the region
 * default. `isUserSelected` is authoritative; the postcode/locality heuristic
 * only covers state persisted before that flag existed.
 */
export function hasSpecificLocation({
	postcode,
	locality,
	isUserSelected,
}: {
	postcode: string;
	locality?: string | null;
	isUserSelected?: boolean;
}): boolean {
	return (
		isUserSelected ??
		(Boolean(locality?.trim()) || postcode.trim() !== DEFAULT_LOCATION.postcode)
	);
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
	isUserSelected?: boolean;
}): boolean {
	return (
		applied.isUserSelected === true ||
		Boolean(applied.locality?.trim()) ||
		applied.postcode !== DEFAULT_LOCATION.postcode ||
		applied.distance !== DEFAULT_LOCATION.distance
	);
}
