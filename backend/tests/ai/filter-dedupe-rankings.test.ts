import { describe, expect, test } from "vitest";
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
});
