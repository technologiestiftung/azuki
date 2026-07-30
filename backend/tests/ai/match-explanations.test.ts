import { describe, expect, test } from "vitest";
import type { MatchSignal } from "@azuki/shared";
import {
	dedupeLabelsAcrossSections,
	parseMatchExplanationContent,
	selectSignalsForPrompt,
	unwrapJsonContent,
} from "../../src/ai/matchExplanations.js";

describe("unwrapJsonContent", () => {
	test("strips markdown json fences", () => {
		const raw = '```json\n{"matching":[],"notMatching":[]}\n```';
		expect(unwrapJsonContent(raw)).toBe('{"matching":[],"notMatching":[]}');
	});

	test("extracts object from prose-prefixed content", () => {
		const raw = 'Hier die Antwort:\n{"matching":[],"notMatching":[]}\nEnde';
		expect(unwrapJsonContent(raw)).toBe('{"matching":[],"notMatching":[]}');
	});
});

describe("parseMatchExplanationContent", () => {
	test("parses clean JSON pills", () => {
		const content = JSON.stringify({
			matching: [
				{
					id: "menschen",
					label: "Menschen",
					icon: "🤝",
					summary: "Du berätst Kundinnen an der Rezeption.",
				},
			],
			notMatching: [
				{
					id: "laerm",
					label: "Lärm",
					icon: "🔊",
					summary: "Die Werkstatt ist oft laut.",
				},
			],
		});

		expect(parseMatchExplanationContent(content)).toEqual({
			matching: [
				{
					id: "match-menschen",
					label: "Menschen",
					icon: "🤝",
					summary: "Du berätst Kundinnen an der Rezeption.",
				},
			],
			notMatching: [
				{
					id: "not-match-laerm",
					label: "Lärm",
					icon: "🔊",
					summary: "Die Werkstatt ist oft laut.",
				},
			],
		});
	});

	test("parses fenced JSON", () => {
		const content = `\`\`\`json
{"matching":[{"id":"natur","label":"Natur","icon":"🌿","summary":"Du arbeitest draußen im Park."}],"notMatching":[]}
\`\`\``;

		const result = parseMatchExplanationContent(content);
		expect(result?.matching).toHaveLength(1);
		expect(result?.matching[0]?.label).toBe("Natur");
		expect(result?.notMatching).toEqual([]);
	});

	test("returns null for invalid JSON", () => {
		expect(parseMatchExplanationContent("not json")).toBeNull();
	});

	test("drops pills missing label or summary", () => {
		const content = JSON.stringify({
			matching: [
				{ id: "a", label: "Ok", icon: "✨", summary: "Passt." },
				{ id: "b", label: "No", icon: "✨" },
			],
			notMatching: [],
		});

		expect(parseMatchExplanationContent(content)?.matching).toEqual([
			{
				id: "match-a",
				label: "Ok",
				icon: "✨",
				summary: "Passt.",
			},
		]);
	});

	test("keeps a single emoji grapheme for icon", () => {
		const content = JSON.stringify({
			matching: [
				{
					id: "tech",
					label: "Technik",
					icon: "🛠️ extra",
					summary: "Du reparierst Geräte.",
				},
			],
			notMatching: [],
		});

		expect(parseMatchExplanationContent(content)?.matching[0]?.icon).toBe("🛠️");
	});
});

describe("dedupeLabelsAcrossSections", () => {
	test("removes matching pills whose label appears in notMatching", () => {
		const result = dedupeLabelsAcrossSections({
			matching: [
				{
					id: "match-natur",
					label: "Natur",
					icon: "🌿",
					summary: "Draußen arbeiten.",
				},
			],
			notMatching: [
				{
					id: "not-match-natur",
					label: "Natur",
					icon: "🌿",
					summary: "Viel Outdoor-Anteil.",
				},
			],
		});

		expect(result.matching).toEqual([]);
		expect(result.notMatching).toHaveLength(1);
	});
});

describe("selectSignalsForPrompt", () => {
	function signal(
		dimension: MatchSignal["dimension"],
		sourceId: string,
		weight = 1,
	): MatchSignal {
		return { kind: "notMatch", dimension, sourceId, weight };
	}

	test("keeps strong conflicts and drops weak when already enough strong", () => {
		const selected = selectSignalsForPrompt({
			matching: [],
			notMatching: [
				signal("noGo", "laerm", 3),
				signal("workPrefMismatch", "people:a", 2),
				signal("expectationMismatch", "teamwork", 2),
				signal("subjectMismatch", "biology", 1),
				signal("strengthMismatch", "craft", 1),
			],
		});

		expect(selected.notMatching.map((s) => s.dimension)).toEqual([
			"noGo",
			"workPrefMismatch",
			"expectationMismatch",
		]);
	});

	test("fills with limited weak mismatches when strong are scarce", () => {
		const selected = selectSignalsForPrompt({
			matching: [],
			notMatching: [
				signal("noGo", "laerm", 3),
				signal("subjectMismatch", "biology", 1),
				signal("subjectMismatch", "math", 1),
				signal("strengthMismatch", "craft", 1),
			],
		});

		expect(selected.notMatching).toHaveLength(3);
		expect(selected.notMatching[0]?.dimension).toBe("noGo");
		expect(
			selected.notMatching
				.slice(1)
				.every(
					(s) =>
						s.dimension === "subjectMismatch" ||
						s.dimension === "strengthMismatch",
				),
		).toBe(true);
	});
});
