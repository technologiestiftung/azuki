import { describe, expect, test } from "vitest";
import {
	buildAvailability,
	type Beruf,
	type PopRecord,
	type DazubiRow,
	type DestatisRow,
} from "../../../scripts/build-availability.js";

describe("buildAvailability — synthetic round-trip", () => {
	const berufe: Beruf[] = [
		{ id: 100, name: "Tischler", germanOccupationCode: "521" },
		{ id: 200, name: "Bäcker", germanOccupationCode: "290" },
		{ id: 300, name: "Anlagenmechaniker", germanOccupationCode: null },
	];
	const pop: PopRecord[] = [
		{
			id: 300,
			name: "Anlagenmechaniker",
			dazubiContracts: 100,
			dazubiMatchType: "direct",
		},
	];
	const dazubi: DazubiRow[] = [
		{ bundesland: "Berlin", name: "Anlagenmechaniker", anfaenger: 12 },
		{ bundesland: "Brandenburg", name: "Anlagenmechaniker", anfaenger: 4 },
		// Non-Bundesland row — must be dropped by isBundesland guard (PR #1)
		{ bundesland: "Deutschland", name: "Anlagenmechaniker", anfaenger: 99 },
		// No matching id — counted as unmatched
		{ bundesland: "Berlin", name: "Unbekannter Beruf", anfaenger: 3 },
	];
	const destatis: DestatisRow[] = [
		{ germanOccupationCode: "521", bundesland: "Berlin", students: 7 },
		{ germanOccupationCode: "521", bundesland: "Brandenburg", students: 2 },
		// No matching code — counted as unmatched
		{ germanOccupationCode: "999", bundesland: "Berlin", students: 1 },
	];

	const { availability, stats } = buildAvailability(
		berufe,
		pop,
		dazubi,
		destatis,
	);

	test("DAZUBI rows joined by normalized name into per-state counts", () => {
		expect(availability[300]?.Berlin).toBe(12);
		expect(availability[300]?.Brandenburg).toBe(4);
	});

	test("non-Bundesland DAZUBI rows are dropped (isBundesland guard)", () => {
		// Cast widens the key type so we can probe for the disallowed "Deutschland"
		// key — its absence is exactly what this test asserts.
		const row = availability[300] as Record<string, number> | undefined;
		expect(row?.Deutschland).toBeUndefined();
	});

	test("Destatis rows joined by germanOccupationCode", () => {
		expect(availability[100]?.Berlin).toBe(7);
		expect(availability[100]?.Brandenburg).toBe(2);
	});

	test("occupations with no matching rows do not appear in output", () => {
		expect(availability[200]).toBeUndefined();
	});

	test("unmatched rows are counted in stats", () => {
		expect(stats.dazubiUnmatched).toBe(1);
		expect(stats.dazubiUnmatchedNames).toEqual(["Unbekannter Beruf"]);
		expect(stats.destatisUnmatched).toBe(1);
	});

	test("matched rows are counted in stats", () => {
		// 2 DAZUBI rows joined (Berlin + Brandenburg for id 300); the "Deutschland"
		// row is dropped before the match step, so it does NOT count as unmatched.
		expect(stats.dazubiMatched).toBe(2);
		expect(stats.destatisMatched).toBe(2);
	});
});

describe("buildAvailability — parent-rollup gated on dazubiMatchType=parent", () => {
	// Two catalog entries whose names both contain " - ". One was matched
	// directly against DAZUBI when popularity-index was built (`direct`); the
	// other only matched via its parent label (`parent`). A DAZUBI row labeled
	// with the bare parent name should only fan out to the `parent` record.
	const berufe: Beruf[] = [
		{ id: 400, name: "Hoch - Spezialberuf", germanOccupationCode: null },
		{ id: 500, name: "Tisch - Variante", germanOccupationCode: null },
	];
	const pop: PopRecord[] = [
		{
			id: 400,
			name: "Hoch - Spezialberuf",
			dazubiContracts: 50,
			dazubiMatchType: "direct",
		},
		{
			id: 500,
			name: "Tisch - Variante",
			dazubiContracts: 10,
			dazubiMatchType: "parent",
		},
	];
	const dazubi: DazubiRow[] = [
		{ bundesland: "Berlin", name: "Hoch", anfaenger: 7 },
		{ bundesland: "Berlin", name: "Tisch", anfaenger: 7 },
	];

	const { availability, stats } = buildAvailability(berufe, pop, dazubi, []);

	test("parent-only DAZUBI label does NOT roll up to dazubiMatchType=direct records", () => {
		expect(availability[400]).toBeUndefined();
	});

	test("parent-only DAZUBI label DOES roll up to dazubiMatchType=parent records", () => {
		expect(availability[500]?.Berlin).toBe(7);
	});

	test("rollup matches are counted in stats.dazubiRollupMatched", () => {
		expect(stats.dazubiRollupMatched).toBe(1);
	});
});

describe("buildAvailability — KldB join normalizes both sides", () => {
	// berufe codes come pre-normalized (via fetch-berufe → normalizeKldb), but
	// the Destatis fixture historically stored only a trimmed code. The join
	// must reconcile a "B "-prefixed / internally-spaced Destatis code with the
	// bare-numeric catalog code rather than silently dropping it to zero.
	const berufe: Beruf[] = [
		{ id: 100, name: "Tischler", germanOccupationCode: "521" },
		{ id: 200, name: "Bäcker", germanOccupationCode: "29302" },
	];
	const destatis: DestatisRow[] = [
		{ germanOccupationCode: "B 521", bundesland: "Berlin", students: 7 },
		{ germanOccupationCode: " 293 02 ", bundesland: "Berlin", students: 3 },
	];

	const { availability, stats } = buildAvailability(berufe, [], [], destatis);

	test("B-prefixed Destatis code joins to the bare-numeric catalog code", () => {
		expect(availability[100]?.Berlin).toBe(7);
	});

	test("whitespace-laden Destatis code joins after normalization", () => {
		expect(availability[200]?.Berlin).toBe(3);
	});

	test("both rows count as matched, none unmatched", () => {
		expect(stats.destatisMatched).toBe(2);
		expect(stats.destatisUnmatched).toBe(0);
	});
});
