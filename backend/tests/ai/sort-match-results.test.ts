import { describe, expect, test } from "vitest";
import { sortMatchResultsByScore } from "../../src/ai/index.js";
import type { MatchResult } from "@azuki/shared";

function occupation(
	overrides: Partial<MatchResult["occupations"][number]> &
		Pick<MatchResult["occupations"][number], "id" | "name" | "score">,
): MatchResult["occupations"][number] {
	return {
		rawName: overrides.name,
		images: [],
		shortDescription: "",
		reasoning: "",
		occupationType: "",
		occupationTag: "beauty-fitness",
		occupationDuration: "",
		occupationEarnings: "",
		...overrides,
	};
}

describe("sortMatchResultsByScore", () => {
	test("sorts by score descending regardless of input order", () => {
		const input = [
			occupation({ id: 1, name: "Friseur/in", score: 85 }),
			occupation({ id: 2, name: "Kosmetiker/in", score: 90 }),
			occupation({ id: 3, name: "MFA", score: 70 }),
		];

		expect(sortMatchResultsByScore(input).map((item) => item.id)).toEqual([
			2, 1, 3,
		]);
	});

	test("breaks score ties by German name", () => {
		const input = [
			occupation({ id: 1, name: "Z Beruf", score: 80 }),
			occupation({ id: 2, name: "A Beruf", score: 80 }),
		];

		expect(sortMatchResultsByScore(input).map((item) => item.id)).toEqual([
			2, 1,
		]);
	});
});
