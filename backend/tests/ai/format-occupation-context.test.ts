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
