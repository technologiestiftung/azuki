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
		expect(extractRankings(content)).toEqual([{ id: 1, begruendung: "a" }]);
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
			{
				id: 15540,
				begruendung: "Du sagst selbst, dass du gut mit Autos umgehen kannst",
			},
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

describe("extractRankings — markdown-fenced responses (Opus 4.6)", () => {
	test("strips ```json ... ``` fences and parses the inner object", () => {
		// Real Opus 4.6 shape observed in eval run 2026-05-20T19-41-16.
		// Opus ignores "ohne Markdown" in the system prompt and wraps.
		const content =
			"```json\n" +
			'{\n  "auswahl": [\n' +
			'    { "id": 6628, "begruendung": "Verkäufer/in passt." },\n' +
			'    { "id": 6649, "begruendung": "Vereinfachte Variante." }\n' +
			"  ]\n" +
			"}\n" +
			"```";
		expect(extractRankings(content)).toEqual([
			{ id: 6628, begruendung: "Verkäufer/in passt." },
			{ id: 6649, begruendung: "Vereinfachte Variante." },
		]);
	});

	test("strips bare ``` ... ``` fences (no language tag)", () => {
		const content = "```\n" + '[{"id": 1, "begruendung": "a"}]' + "\n```";
		expect(extractRankings(content)).toEqual([{ id: 1, begruendung: "a" }]);
	});

	test("recovers from raw carriage returns inside string values", () => {
		// Opus 4.6 occasionally emits raw \r inside begruendung values
		// (observed in eval run 2026-05-20T19-45-35 where nico/karim/hanna
		// fell back consistently). JSON spec disallows unescaped control
		// chars inside strings, so JSON.parse fails until they're stripped.
		const content =
			"```json\n" +
			'{ "auswahl": [ { "id": 1, "begruendung": "okay\rstill ok" } ] }\n' +
			"```";
		expect(extractRankings(content)).toEqual([
			{ id: 1, begruendung: "okaystill ok" },
		]);
	});

	test("recovers when stray ASCII quote appears inside a string value (stray + letter)", () => {
		// Real Opus 4.6 shape from eval run 2026-05-20T19-54. Opens a
		// quoted profile phrase with German „ but closes with ASCII ",
		// breaking JSON.parse. Schema-aware fallback walks balanced
		// braces and anchors begruendung capture on `}`.
		const content =
			'```json\n{\n  "auswahl": [\n' +
			'    { "id": 6628, "begruendung": "Du schreibst: „in Markt ich weiß wo alles ist." Das zeigt." }\n' +
			"  ]\n}\n```";
		const result = extractRankings(content);
		expect(result).not.toBeNull();
		expect(result).toHaveLength(1);
		expect(result?.[0].id).toBe(6628);
		expect(result?.[0].begruendung).toContain("Das zeigt");
	});

	test("recovers when stray ASCII quote is followed by comma (stray + ,)", () => {
		// Real Opus 4.6 shape from eval run 2026-05-20T20-02. The stray
		// quote is followed by `,` — looks like a valid value-terminator
		// to a character-level heuristic, but the schema-aware fallback
		// anchors on `}` so the value spans the whole text.
		const content =
			'```json\n{ "auswahl": [\n' +
			'  { "id": 137684, "begruendung": "Deine Stärke, „schwierige Texte in einfache Sprache zu bringen", hilft dir dabei." }\n' +
			"] }\n```";
		const result = extractRankings(content);
		expect(result).not.toBeNull();
		expect(result).toHaveLength(1);
		expect(result?.[0].id).toBe(137684);
		expect(result?.[0].begruendung).toContain("hilft dir dabei");
	});

	test("recovers from raw tabs inside string values", () => {
		// Opus 4.6 also emits raw \t inside string values, observed in
		// eval run 2026-05-20T19-49 where all "hard" personas fell back.
		// In a terminal these tabs render as huge whitespace gaps between
		// JSON fields. Same control-char issue as \r.
		const content =
			'{ "auswahl": [ { "id": 1, "begruendung": "Hat\tab inside" } ] }';
		expect(extractRankings(content)).toEqual([
			{ id: 1, begruendung: "Hatab inside" },
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
