import { describe, expect, test } from "vitest";
import { formatOccupationContext } from "../../src/ai/index.js";
import { makeOccupation } from "../scoring/helpers.js";

// Sample IDs picked from popularity-index.json — change them only if a
// future popularity refresh retiers any of these Berufe.

describe("formatOccupationContext", () => {
	test("A_anchor Beruf with DAZUBI contracts — Verkäufer/in", () => {
		const occ = makeOccupation({ id: 6628, accessLevel: "unrestricted" });
		const ctx = formatOccupationContext(occ);
		expect(ctx).toContain("Sehr beliebte Ausbildung");
		expect(ctx).toContain("Plätze/Jahr");
		expect(ctx).toContain("Zugang ohne formalen Schulabschluss möglich");
	});

	test("C_smallReal schulische Beruf — Designer/in Grafik", () => {
		const occ = makeOccupation({
			id: 14217,
			accessLevel: "fachhochschulreife",
		});
		const ctx = formatOccupationContext(occ);
		expect(ctx).toContain("Kleine Ausbildung");
		expect(ctx).toContain("Plätze/Jahr");
		expect(ctx).toContain("Fachhochschulreife");
		expect(ctx).toContain("Realschule + vorherige Berufsausbildung");
	});

	test("F_fachpraktiker with resolved parent names the parent direction", () => {
		// id 4708 = FP Lagerlogistik §66; parent 27448 = Fachkraft Lagerlogistik.
		// The direction-named phrasing prevents the LLM from treating §66 as
		// a universal "good-for-Hauptschule" pick (Nico-IT-§66 regression).
		const occ = makeOccupation({
			id: 4708,
			parentId: 27448,
			accessLevel: "unrestricted",
		});
		const ctx = formatOccupationContext(occ);
		expect(ctx).toContain("§66-Variante des Berufs");
		expect(ctx).toContain("Fachkraft - Lagerlogistik");
		expect(ctx).toContain("vereinfachte Form");
		// §66 records have no DAZUBI/schulische counts; no "Plätze/Jahr" suffix.
		expect(ctx).not.toContain("Plätze/Jahr");
	});

	test("F_fachpraktiker without parentId falls back to generic §66 phrasing", () => {
		const occ = makeOccupation({
			id: 4708,
			parentId: null,
			accessLevel: "unrestricted",
		});
		const ctx = formatOccupationContext(occ);
		expect(ctx).toContain("§66 BBiG / §42r HwO");
		expect(ctx).toContain("vereinfachte Form");
		expect(ctx).not.toContain("§66-Variante des Berufs");
	});

	test("A_anchor schulische Beruf — Erzieher/in (practical-FHR)", () => {
		const occ = makeOccupation({
			id: 9162,
			accessLevel: "fachhochschulreife",
		});
		const ctx = formatOccupationContext(occ);
		expect(ctx).toContain("Sehr beliebte Ausbildung");
		// Erzieher uses schulische counts in the tens of thousands.
		expect(ctx).toMatch(/Plätze\/Jahr/);
		expect(ctx).toContain("Realschule + vorherige Berufsausbildung");
	});

	test("returns null when neither popularity nor access info exists", () => {
		// Off-index ID + null accessLevel → no signal to inject.
		const occ = makeOccupation({ id: 999999, accessLevel: null });
		expect(formatOccupationContext(occ)).toBeNull();
	});

	test("joins popularity and access with a separator", () => {
		const occ = makeOccupation({ id: 6628, accessLevel: "hauptschule" });
		const ctx = formatOccupationContext(occ);
		expect(ctx).toMatch(/^Sehr beliebte Ausbildung.*\|\s+Zugang/);
	});
});
