import { describe, expect, test } from "vitest";
import type { PopularityRecord } from "@azuki/shared";
import {
	searchOccupations,
	type SearchOptions,
} from "../../src/components/personas/occupation-search";

const records: PopularityRecord[] = [
	{
		id: 1,
		name: "Fachkraft - Lagerlogistik",
		category: "dual",
		dazubiContracts: 9000,
		dazubiMatchType: "direct",
		salaryKnown: true,
		hasDegreeStats: true,
		popularityTier: "A_anchor",
	},
	{
		id: 2,
		name: "Fluglotse/Fluglotsin",
		category: "dual",
		dazubiContracts: 50,
		dazubiMatchType: "direct",
		salaryKnown: true,
		hasDegreeStats: true,
		popularityTier: "D_niche",
	},
	{
		id: 3,
		name: "Geigenbauer/in",
		category: "dual",
		dazubiContracts: 3,
		dazubiMatchType: "direct",
		salaryKnown: true,
		hasDegreeStats: true,
		popularityTier: "E_vanishing",
	},
];

describe("searchOccupations", () => {
	test("empty query returns all (capped by limit)", () => {
		const out = searchOccupations(records, {} as SearchOptions);
		expect(out.results.length).toBe(3);
		expect(out.total).toBe(3);
	});

	test("substring match on name (case-insensitive)", () => {
		const out = searchOccupations(records, { query: "lager" });
		expect(out.results).toEqual([records[0]]);
		expect(out.total).toBe(1);
	});

	test("filter by popularity tier", () => {
		const out = searchOccupations(records, { tier: "D_niche" });
		expect(out.results).toEqual([records[1]]);
		expect(out.total).toBe(1);
	});

	test("query AND tier filter combined", () => {
		const out = searchOccupations(records, {
			query: "fluglotse",
			tier: "D_niche",
		});
		expect(out.results).toEqual([records[1]]);
		expect(out.total).toBe(1);
	});

	test("limit caps result list but total reflects full match count", () => {
		const out = searchOccupations(records, { limit: 1 });
		expect(out.results.length).toBe(1);
		expect(out.total).toBe(3);
	});

	test("results sorted by name", () => {
		const out = searchOccupations(records, {});
		expect(out.results.map((r) => r.name)).toEqual([
			"Fachkraft - Lagerlogistik",
			"Fluglotse/Fluglotsin",
			"Geigenbauer/in",
		]);
	});
});
