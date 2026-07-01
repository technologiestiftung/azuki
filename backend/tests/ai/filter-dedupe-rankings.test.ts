import { describe, expect, test } from "vitest";
import { FINAL_MATCH_COUNT } from "../../src/matching/index.js";
import { filterAndDedupeRankings } from "../../src/ai/index.js";

describe("filterAndDedupeRankings", () => {
	test("drops rankings whose id is not in the valid set", () => {
		const rankings = [
			{ id: 1, begruendung: "a" },
			{ id: 999, begruendung: "rogue" },
			{ id: 2, begruendung: "b" },
		];
		const validIds = new Set([1, 2, 3]);
		expect(filterAndDedupeRankings(rankings, validIds)).toEqual([
			{ id: 1, begruendung: "a" },
			{ id: 2, begruendung: "b" },
		]);
	});

	test("drops duplicate ids, keeping the first occurrence", () => {
		// Real LLM bug: same id emitted twice in the ranking array.
		// Mia v3 run 3 had this exact shape with id 9910 (Friseur).
		const rankings = [
			{ id: 9910, begruendung: "Friseur passt zum Salon-Praktikum" },
			{ id: 14624, begruendung: "Kosmetiker dual" },
			{ id: 9910, begruendung: "(LLM emitted duplicate — drop this)" },
			{ id: 33212, begruendung: "MFA als Plan B" },
		];
		const validIds = new Set([9910, 14624, 33212]);
		expect(filterAndDedupeRankings(rankings, validIds)).toEqual([
			{ id: 9910, begruendung: "Friseur passt zum Salon-Praktikum" },
			{ id: 14624, begruendung: "Kosmetiker dual" },
			{ id: 33212, begruendung: "MFA als Plan B" },
		]);
	});

	test("preserves order of the first occurrence of each valid id", () => {
		const rankings = [
			{ id: 3, begruendung: "c" },
			{ id: 1, begruendung: "a" },
			{ id: 2, begruendung: "b" },
		];
		const validIds = new Set([1, 2, 3]);
		expect(
			filterAndDedupeRankings(rankings, validIds).map((r) => r.id),
		).toEqual([3, 1, 2]);
	});

	test("returns empty array when no rankings are valid", () => {
		const rankings = [
			{ id: 100, begruendung: "x" },
			{ id: 200, begruendung: "y" },
		];
		const validIds = new Set([1, 2, 3]);
		expect(filterAndDedupeRankings(rankings, validIds)).toEqual([]);
	});

	test("returns empty array on empty input", () => {
		expect(filterAndDedupeRankings([], new Set([1, 2]))).toEqual([]);
	});

	test("caps the result to `limit`, keeping the top-N in order", () => {
		// A non-compliant LLM could echo the whole candidate list; the
		// frontend renders the final shortlist, so the result must be capped.
		const rankings = Array.from({ length: 40 }, (_, i) => ({
			id: i + 1,
			begruendung: `b${i + 1}`,
		}));
		const validIds = new Set(rankings.map((r) => r.id));
		const out = filterAndDedupeRankings(rankings, validIds, FINAL_MATCH_COUNT);
		expect(out).toHaveLength(FINAL_MATCH_COUNT);
		expect(out.map((r) => r.id)).toEqual(
			Array.from({ length: FINAL_MATCH_COUNT }, (_, i) => i + 1),
		);
	});

	test("cap counts valid, unique rankings — duplicates and rogue ids don't consume a slot", () => {
		const rankings = [
			{ id: 1, begruendung: "a" },
			{ id: 999, begruendung: "rogue" },
			{ id: 1, begruendung: "dup" },
			{ id: 2, begruendung: "b" },
			{ id: 3, begruendung: "c" },
		];
		const validIds = new Set([1, 2, 3]);
		expect(
			filterAndDedupeRankings(rankings, validIds, 2).map((r) => r.id),
		).toEqual([1, 2]);
	});

	test("no limit leaves the full deduped list unbounded", () => {
		const rankings = Array.from({ length: 12 }, (_, i) => ({
			id: i + 1,
			begruendung: `b${i + 1}`,
		}));
		const validIds = new Set(rankings.map((r) => r.id));
		expect(filterAndDedupeRankings(rankings, validIds)).toHaveLength(12);
	});
});
