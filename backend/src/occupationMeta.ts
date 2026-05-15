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
	const occupationDuration =
		rawDuration.length > 0 && rawDuration.length <= 80
			? rawDuration
			: rawDuration.length > 80
				? `${rawDuration.slice(0, 77)}…`
				: "";

	let occupationEarnings = "";
	const payMarker = "Was verdient man in der Ausbildung?";
	const payIdx = long.indexOf(payMarker);
	if (payIdx !== -1) {
		const after = long.slice(payIdx + payMarker.length).trimStart();
		const firstYear = after.match(
			/1\.\s*Ausbildungsjahr:\s*(.+?)(?=\s*2\.\s*Ausbildungsjahr|Welcher Schulabschluss|Ausbildungsbereich|$)/s,
		);
		if (firstYear?.[1]) {
			let firstYearPaySummary = firstYear[1].trim().replace(/\s+/g, " ");
			if (firstYearPaySummary.length > 52) {
				firstYearPaySummary = `${firstYearPaySummary.slice(0, 49)}…`;
			}
			occupationEarnings = firstYearPaySummary;
		}
	}

	return { occupationType, occupationDuration, occupationEarnings };
}
