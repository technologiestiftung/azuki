import type { Occupation } from "./types";

/** Badge-friendly duration without "i.d.R." / "i. d. R." qualifiers. */
export function formatOccupationDuration(raw: string): string {
	const cleaned = raw
		.replace(/\s*,?\s*i\.\s*d\.\s*R\.?\s*/gi, " ")
		.replace(/\s+/g, " ")
		.replace(/,\s*$/, "")
		.trim();

	if (cleaned.length === 0) {
		return "";
	}
	if (/^unterschiedlich/i.test(cleaned)) {
		return "";
	}
	if (cleaned.length <= 80) {
		return cleaned;
	}
	return `${cleaned.slice(0, 77)}…`;
}

export function resolveOccupationDuration(
	occupation: Occupation | null | undefined,
): string {
	const short = occupation?.descriptionShort ?? "";
	const durationMatch = short.match(/Ausbildungsdauer\s+(.+?)\s+Lernorte/s);
	const rawDuration = durationMatch?.[1]?.trim() ?? "";
	return rawDuration ? formatOccupationDuration(rawDuration) : "";
}
