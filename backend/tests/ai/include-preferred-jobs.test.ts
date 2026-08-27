import { describe, expect, test } from "vitest";
import type { MatchResult, UserProfile } from "@azuki/shared";
import { includePreferredJobs } from "../../src/ai/index.js";
import type { ScoredOccupation } from "../../src/matching/index.js";
import { makeOccupation, makeProfile } from "../scoring/helpers.js";

function scoredEntry(
	id: number,
	name: string,
	score: number,
): ScoredOccupation {
	return { occupation: makeOccupation({ id, name }), score };
}

function matched(
	id: number,
	name: string,
	score: number,
): MatchResult["occupations"][number] {
	return {
		id,
		name,
		rawName: name,
		score,
		images: [],
		shortDescription: "",
		reasoning: "",
		occupationType: "",
		occupationTag: "beauty-fitness",
		occupationDuration: "",
		occupationEarnings: "",
		salaryKnown: false,
		salaryMonthlyMedian: null,
	};
}

const SCORED: ScoredOccupation[] = [
	scoredEntry(1, "Friseur/in", 30),
	scoredEntry(2, "Kosmetiker/in", 25),
	scoredEntry(3, "Tischler/in", 20),
	scoredEntry(4, "Florist/in", 15),
];

function profileWithWish(...preferredJobs: string[]): UserProfile {
	return makeProfile({ preferredJobs });
}

describe("includePreferredJobs", () => {
	test("leaves the LLM order untouched when no wish was entered", () => {
		const ranked = [
			matched(3, "Tischler/in", 20),
			matched(1, "Friseur/in", 30),
		];

		expect(
			includePreferredJobs(ranked, SCORED, profileWithWish()).map((o) => o.id),
		).toEqual([3, 1]);
	});

	test("flags a named Beruf without moving it", () => {
		const ranked = [
			matched(3, "Tischler/in", 20),
			matched(1, "Friseur/in", 30),
			matched(4, "Florist/in", 15),
		];

		const result = includePreferredJobs(
			ranked,
			SCORED,
			profileWithWish("Florist"),
		);

		expect(result.map((o) => o.id)).toEqual([3, 1, 4]);
		expect(result[2].preferredJobMatch).toBe(true);
		expect(result[0].preferredJobMatch).toBeUndefined();
	});

	test("keeps the LLM order regardless of how many wishes match", () => {
		const ranked = [
			matched(3, "Tischler/in", 20),
			matched(4, "Florist/in", 15),
			matched(2, "Kosmetiker/in", 25),
			matched(1, "Friseur/in", 30),
		];

		expect(
			includePreferredJobs(
				ranked,
				SCORED,
				profileWithWish("Florist", "Kosmetiker"),
			).map((o) => o.id),
		).toEqual([3, 4, 2, 1]);
	});

	test("forces back a named Beruf the LLM left out", () => {
		const ranked = [
			matched(3, "Tischler/in", 20),
			matched(1, "Friseur/in", 30),
		];

		const result = includePreferredJobs(
			ranked,
			SCORED,
			profileWithWish("Florist"),
		);

		expect(result.map((o) => o.id)).toEqual([3, 1, 4]);
		expect(result[2].preferredJobMatch).toBe(true);
	});

	test("does not force in a vague keyword-tier match the LLM skipped", () => {
		const scored = [
			...SCORED,
			scoredEntry(5, "Fachkraft - Möbel-, Küchen- und Umzugsservice", 5),
		];
		const ranked = [matched(1, "Friseur/in", 30)];

		expect(
			includePreferredJobs(
				ranked,
				scored,
				profileWithWish("irgendwas mit Möbeln"),
			).map((o) => o.id),
		).toEqual([1]);
	});
});
