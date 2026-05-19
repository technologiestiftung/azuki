import { describe, expect, test } from "vitest";
import { extractRankings } from "../../src/ai/index.js";

describe("extractRankings — happy path", () => {
	test("parses a clean JSON array", () => {
		const content = `[{"id": 12345, "begruendung": "passt gut"}, {"id": 67890, "begruendung": "auch ok"}]`;
		expect(extractRankings(content)).toEqual([
			{ id: 12345, begruendung: "passt gut" },
			{ id: 67890, begruendung: "auch ok" },
		]);
	});

	test("recovers array under known keys (berufe)", () => {
		const content = `{"berufe": [{"id": 1, "begruendung": "a"}]}`;
		expect(extractRankings(content)).toEqual([
			{ id: 1, begruendung: "a" },
		]);
	});

	test("recovers array under an unknown key (results, auswahl, ranking, etc.)", () => {
		const content = `{"auswahl": [{"id": 7, "begruendung": "x"}, {"id": 8, "begruendung": "y"}]}`;
		expect(extractRankings(content)).toEqual([
			{ id: 7, begruendung: "x" },
			{ id: 8, begruendung: "y" },
		]);
	});
});

describe("extractRankings — prose-prefixed responses", () => {
	test("extracts the array even when the model adds analysis before it (Claude shape)", () => {
		const content = `Analyse des Profils:

Der Jugendliche hat klare eigene Worte: Logistik...

Beste Matches:
1. **Fahrzeuglackierer/in** (15540) - Auto-Bezug

[
  { "id": 15540, "begruendung": "Du sagst selbst, dass du gut mit Autos umgehen kannst" },
  { "id": 136199, "begruendung": "Sicherheit und Stabilität" }
]`;
		expect(extractRankings(content)).toEqual([
			{ id: 15540, begruendung: "Du sagst selbst, dass du gut mit Autos umgehen kannst" },
			{ id: 136199, begruendung: "Sicherheit und Stabilität" },
		]);
	});

	test("ignores bracket characters inside JSON strings", () => {
		const content = `Hier: [{"id": 1, "begruendung": "siehe [unten]"}, {"id": 2, "begruendung": "ok"}]`;
		expect(extractRankings(content)).toEqual([
			{ id: 1, begruendung: "siehe [unten]" },
			{ id: 2, begruendung: "ok" },
		]);
	});

	test("handles escaped quotes inside strings", () => {
		const content = `[{"id": 1, "begruendung": "er sagte \\"ja\\""}]`;
		expect(extractRankings(content)).toEqual([
			{ id: 1, begruendung: 'er sagte "ja"' },
		]);
	});
});

describe("extractRankings — degenerate cases", () => {
	test("returns null for empty content", () => {
		expect(extractRankings("")).toBeNull();
	});

	test("returns null when there is no array at all", () => {
		expect(extractRankings("just prose, nothing here")).toBeNull();
	});

	test("returns null when the array contains non-{id} entries", () => {
		expect(extractRankings('["foo", "bar"]')).toBeNull();
	});

	test("ignores missing begruendung field (treats as empty string)", () => {
		expect(extractRankings('[{"id": 42}]')).toEqual([
			{ id: 42, begruendung: "" },
		]);
	});

	test("returns null for an empty array (we'd rather fall back than report 0 picks)", () => {
		expect(extractRankings("[]")).toBeNull();
	});
});
