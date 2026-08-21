import { describe, expect, it } from "vitest";
import { WILDCARD_POOL_OCCUPATION_IDS } from "@azuki/shared";
import {
	pickWildcardOccupations,
	toWildcardMatchedOccupation,
} from "../src/wildcards.js";
import { makeOccupation } from "./scoring/helpers.js";

const [poolIdA, poolIdB, poolIdC] = WILDCARD_POOL_OCCUPATION_IDS;

function makePoolCatalog(): ReturnType<typeof makeOccupation>[] {
	return [
		...WILDCARD_POOL_OCCUPATION_IDS.map((id) =>
			makeOccupation({ id, name: `Pool Beruf ${id}` }),
		),
		makeOccupation({ id: 999990, name: "Nicht im Pool" }),
	];
}

describe("pickWildcardOccupations", () => {
	it("only returns occupations from the wildcard pool", () => {
		const catalog = makePoolCatalog();
		const picks = pickWildcardOccupations(catalog, new Set(), 5);
		for (const pick of picks) {
			expect(WILDCARD_POOL_OCCUPATION_IDS).toContain(pick.id);
		}
	});

	it("excludes ids already present in the match results", () => {
		const catalog = makePoolCatalog();
		const excludeIds = new Set(WILDCARD_POOL_OCCUPATION_IDS.slice(3));
		const picks = pickWildcardOccupations(catalog, excludeIds, 5);
		for (const pick of picks) {
			expect(excludeIds.has(pick.id)).toBe(false);
		}
	});

	it("never returns more than count entries", () => {
		const catalog = makePoolCatalog();
		const picks = pickWildcardOccupations(catalog, new Set(), 5);
		expect(picks.length).toBeLessThanOrEqual(5);
	});

	it("returns fewer than count when exclusions exhaust the pool", () => {
		const catalog = [
			makeOccupation({ id: poolIdA }),
			makeOccupation({ id: poolIdB }),
			makeOccupation({ id: poolIdC }),
		];
		const excludeIds = new Set([poolIdA, poolIdB]);
		const picks = pickWildcardOccupations(catalog, excludeIds, 5);
		expect(picks).toHaveLength(1);
		expect(picks[0].id).toBe(poolIdC);
	});

	it("returns nothing when the pool is entirely excluded or absent from the catalog", () => {
		const catalog = [makeOccupation({ id: 999990 })];
		const picks = pickWildcardOccupations(catalog, new Set(), 5);
		expect(picks).toHaveLength(0);
	});
});

describe("toWildcardMatchedOccupation", () => {
	it("carries no match score or reasoning", () => {
		const matched = toWildcardMatchedOccupation(
			makeOccupation({ id: poolIdA, name: "Test Beruf" }),
		);
		expect(matched.score).toBe(0);
		expect(matched.reasoning).toBe("");
		expect(matched.id).toBe(poolIdA);
	});
});
