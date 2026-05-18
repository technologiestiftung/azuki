import type { Occupation } from "@azuki/shared";

/** Stable id for filter chips (e.g. `dual`); empty if unknown. */
export function resolveOccupationTypeKey(artText: string): string {
	const t = artText.toLowerCase();
	if (t.includes("duale ausbildung") || t.includes("doppelt qualifizierende")) {
		return "dual";
	}
	if (
		t.includes("schulische ausbildung") ||
		t.includes("schulische aus- bzw. weiterbildung") ||
		t.includes("berufsfachschul") ||
		t.includes("berufskolleg") ||
		t.includes("bildungseinrichtung")
	) {
		return "school";
	}
	return "";
}

function parseEuroAmount(value: string): number {
	return parseFloat(value.replace(/\./g, "").replace(",", "."));
}

const EARNINGS_PERIOD_SUFFIX = " / Monat";

function formatGermanEuro(amount: number): string {
	return `${amount.toLocaleString("de-DE", { maximumFractionDigits: 0 })} €`;
}

/** Compact badge text from the 1. Ausbildungsjahr pay snippet (monthly amounts only). */
export function formatFirstYearEarnings(firstYearText: string): string {
	const amounts = [
		...firstYearText.matchAll(/(\d{1,3}(?:\.\d{3})*(?:,\d+)?)\s*€/g),
	]
		.map((match) => parseEuroAmount(match[1]))
		.filter((n) => !Number.isNaN(n) && n > 0);

	if (amounts.length === 0) {
		return "";
	}

	const min = Math.min(...amounts);
	const max = Math.max(...amounts);
	if (min === max) {
		return `${formatGermanEuro(min)}${EARNINGS_PERIOD_SUFFIX}`;
	}
	return `${min.toLocaleString("de-DE", { maximumFractionDigits: 0 })}-${max.toLocaleString("de-DE", { maximumFractionDigits: 0 })} €${EARNINGS_PERIOD_SUFFIX}`;
}

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

export function occupationMatchMeta(occupation: Occupation): {
	occupationType: string;
	occupationDuration: string;
	occupationEarnings: string;
} {
	const short = occupation.descriptionShort ?? "";
	const long = occupation.descriptionLong ?? "";

	const artMatch = short.match(/Ausbildungsart\s+(.+?)\s+Ausbildungsdauer/s);
	const durationMatch = short.match(/Ausbildungsdauer\s+(.+?)\s+Lernorte/s);

	const artText = artMatch?.[1]?.trim() ?? "";
	const occupationType = artText ? resolveOccupationTypeKey(artText) : "";

	const rawDuration = durationMatch?.[1]?.trim() ?? "";
	const occupationDuration = rawDuration ? formatOccupationDuration(rawDuration) : "";

	let occupationEarnings = "";
	const payMarker = "Was verdient man in der Ausbildung?";
	const payIdx = long.indexOf(payMarker);
	if (payIdx !== -1) {
		const after = long.slice(payIdx + payMarker.length).trimStart();
		const firstYear = after.match(
			/1\.\s*Ausbildungsjahr:\s*(.+?)(?=\s*2\.\s*Ausbildungsjahr|Welcher Schulabschluss|Ausbildungsbereich|$)/s,
		);
		if (firstYear?.[1]) {
			occupationEarnings = formatFirstYearEarnings(firstYear[1]);
		}
	}

	return { occupationType, occupationDuration, occupationEarnings };
}
