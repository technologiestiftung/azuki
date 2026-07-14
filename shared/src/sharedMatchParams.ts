export const SHARED_OCCUPATIONS_PARAM = "o";
export const SHARED_POSTCODE_PARAM = "plz";
export const SHARED_DISTANCE_PARAM = "d";

const ENTRY_SEPARATOR = "_";
const FIT_SEPARATOR = "-";

export interface SharedOccupationEntry {
	id: number;
	fit: number;
}

function parseSharedOccupationEntry(
	part: string,
): SharedOccupationEntry | null {
	const trimmed = part.trim();
	if (!trimmed) {
		return null;
	}

	const dashIndex = trimmed.indexOf(FIT_SEPARATOR);
	if (dashIndex > 0) {
		const id = Number.parseInt(trimmed.slice(0, dashIndex), 10);
		const fit = Number.parseInt(trimmed.slice(dashIndex + 1), 10);
		if (Number.isFinite(id) && Number.isFinite(fit)) {
			return {
				id,
				fit: Math.min(100, Math.max(0, fit)),
			};
		}
	}

	// Legacy share links used `id:fit` pairs separated by commas.
	const colonIndex = trimmed.indexOf(":");
	if (colonIndex <= 0) {
		return null;
	}
	const id = Number.parseInt(trimmed.slice(0, colonIndex), 10);
	const fit = Number.parseInt(trimmed.slice(colonIndex + 1), 10);
	if (!Number.isFinite(id) || !Number.isFinite(fit)) {
		return null;
	}
	return {
		id,
		fit: Math.min(100, Math.max(0, fit)),
	};
}

export function parseSharedOccupationsParam(
	param: string,
): SharedOccupationEntry[] {
	if (!param.trim()) {
		return [];
	}

	const separator = param.includes(ENTRY_SEPARATOR) ? ENTRY_SEPARATOR : ",";
	return param
		.split(separator)
		.map(parseSharedOccupationEntry)
		.filter((entry): entry is SharedOccupationEntry => entry !== null);
}

export function buildSharedOccupationsParam(
	entries: SharedOccupationEntry[],
): string {
	return entries
		.map((entry) => `${entry.id}${FIT_SEPARATOR}${entry.fit}`)
		.join(ENTRY_SEPARATOR);
}
