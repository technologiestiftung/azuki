import { describe, expect, it } from "vitest";
import { formatOccupationDisplayName } from "@azuki/shared";
import { formatOccupationDuration } from "@azuki/shared";
import {
	formatFirstYearEarnings,
	occupationMatchMeta,
	resolveOccupationTypeKey,
} from "../src/occupationMeta.js";
import { makeOccupation } from "./scoring/helpers.js";

describe("formatOccupationDisplayName", () => {
	it("removes trailing (Ausbildung)", () => {
		expect(
			formatOccupationDisplayName(
				"Theater-Regisseur/in/Spielleiter/in (Ausbildung)",
			),
		).toBe("Theater-Regisseur/in/Spielleiter/in");
	});

	it("removes inline (Ausbildung) before a specialization", () => {
		expect(
			formatOccupationDisplayName("Designer/in (Ausbildung) - Grafik"),
		).toBe("Designer/in - Grafik");
	});

	it("removes training-type parentheticals", () => {
		expect(
			formatOccupationDisplayName("Kosmetiker/in (duale Ausbildung)"),
		).toBe("Kosmetiker/in");
		expect(
			formatOccupationDisplayName(
				"Ausbaumanager/in (doppelt qualifizierende Ausbildung)",
			),
		).toBe("Ausbaumanager/in");
	});

	it("leaves titles without redundant qualifiers unchanged", () => {
		expect(formatOccupationDisplayName("Kaufmann/-frau im Einzelhandel")).toBe(
			"Kaufmann/-frau im Einzelhandel",
		);
	});
});

describe("formatOccupationDuration", () => {
	it("removes i.d.R. and surrounding punctuation", () => {
		expect(formatOccupationDuration("3 Jahre i.d.R.")).toBe("3 Jahre");
		expect(formatOccupationDuration("3 Jahre, i. d. R.")).toBe("3 Jahre");
	});

	it("leaves duration unchanged when no qualifier is present", () => {
		expect(formatOccupationDuration("2 Jahre")).toBe("2 Jahre");
	});

	it("returns empty for variable Unterschiedlich durations", () => {
		expect(
			formatOccupationDuration(
				"Unterschiedlich, je nach Bildungsanbieter, Unterrichtszeit (Vollzeit/Teilzeit) und Lernform",
			),
		).toBe("");
		expect(
			formatOccupationDuration(
				"Unterschiedlich, 2-3 Jahre (Vollzeit) - je nach Bildungsanbieter und Lernform",
			),
		).toBe("");
	});
});

describe("formatFirstYearEarnings", () => {
	it("formats a single first-year amount", () => {
		expect(formatFirstYearEarnings("1.416 €")).toBe("1.416 € / Monat");
	});

	it("formats a first-year range across sectors", () => {
		expect(
			formatFirstYearEarnings("940 € bis 1.120 € (Handel*), 979 € (Handwerk)"),
		).toBe("940-1.120 € / Monat");
	});

	it("returns empty for prose without amounts", () => {
		expect(
			formatFirstYearEarnings(
				"Während der Ausbildung erhält man keine Vergütung.",
			),
		).toBe("");
	});
});

describe("occupationMatchMeta", () => {
	it("strips i.d.R. from duration in descriptionShort", () => {
		const meta = occupationMatchMeta(
			makeOccupation({
				descriptionShort:
					"Ausbildungsart Duale Ausbildung Ausbildungsdauer 3 Jahre i.d.R. Lernorte Betrieb",
			}),
		);
		expect(meta.occupationDuration).toBe("3 Jahre");
	});

	it("omits duration badge when Ausbildungsdauer is Unterschiedlich", () => {
		const meta = occupationMatchMeta(
			makeOccupation({
				descriptionShort:
					"Ausbildungsart Schulische Ausbildung an unterschiedlichen Bildungseinrichtungen Ausbildungsdauer Unterschiedlich, je nach Bildungsanbieter Lernorte Bildungseinrichtung",
			}),
		);
		expect(meta.occupationDuration).toBe("");
	});

	it("extracts first-year pay only, not second year", () => {
		const meta = occupationMatchMeta(
			makeOccupation({
				descriptionLong:
					"Was verdient man in der Ausbildung? Beispielhafte Ausbildungsvergütungen pro Monat: 1. Ausbildungsjahr: 940 € bis 1.120 € (Handel*) 2. Ausbildungsjahr: 1.000 € bis 1.250 € (Handel*)",
			}),
		);
		expect(meta.occupationEarnings).toBe("940-1.120 € / Monat");
	});

	it("leaves earnings empty when no first-year amounts exist", () => {
		const meta = occupationMatchMeta(
			makeOccupation({
				descriptionLong:
					"Was verdient man in der Ausbildung? Während der Ausbildung erhält man keine Vergütung.",
			}),
		);
		expect(meta.occupationEarnings).toBe("");
	});
});

describe("resolveOccupationTypeKey", () => {
	it("maps duale Ausbildung to dual", () => {
		expect(resolveOccupationTypeKey("Duale Ausbildung")).toBe("dual");
	});
});
