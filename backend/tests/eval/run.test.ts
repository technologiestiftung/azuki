import { describe, expect, test, vi, beforeEach } from "vitest";
import type { EvalSnapshot, Persona, PersonaResult } from "@azuki/shared";

vi.mock("../../src/ai/index.js", () => ({
	aiRank: vi.fn(),
}));

import { runEval } from "../../eval/run.js";
import { aiRank } from "../../src/ai/index.js";

const baseProfile = {
	inSchool: false,
	educationLevel: "secondary" as const,
	favoriteSubjects: [],
	customSubjects: [],
	interests: [],
	customInterests: [],
	workExpectations: [],
	customWorkExpectations: [],
	strengths: {},
	customStrengths: [],
	selectedCustomStrengths: [],
	practicalExperiences: [],
	selectedPracticalExperienceIds: [],
	workPreferences: {},
	noGos: {},
	customNoGos: [],
};

function makePersona(id: string): Persona {
	return {
		id,
		name: id,
		description: null,
		profile: baseProfile,
		tierS: [],
		tierA: [],
		tierC: [],
		criteria: [],
		createdAt: "2026-04-30T00:00:00Z",
		updatedAt: "2026-04-30T00:00:00Z",
	};
}

const MINIMAL_OCCUPATIONS = [
	{
		id: 1,
		name: "Test",
		descriptionShort: null,
		descriptionLong: null,
		taskSummary: "task",
		images: [],
		degreeStats: null,
		subjects: [],
		interests: [],
		interestKeywords: [],
		strengthTags: [],
		skillTags: [],
		conditions: {} as never,
		salaryMonthlyMedian: null,
		salaryKnown: false,
		digitalizationSignal: false,
		workLocations: "",
		competenciesText: "",
	},
];

describe("runEval", () => {
	beforeEach(() => {
		vi.mocked(aiRank).mockReset();
	});

	test("returns snapshot keyed by persona id strings", async () => {
		vi.mocked(aiRank).mockResolvedValue({
			occupations: [
				{
					id: 1,
					name: "Test",
					score: 0.5,
					images: [],
					taskSummary: "task",
					reasoning: "fits",
				},
			],
		});
		const personas = [makePersona("nico"), makePersona("maria-2026")];
		const snap: EvalSnapshot = await runEval({
			systemPrompt: "p",
			model: "m",
			occupations: MINIMAL_OCCUPATIONS as never,
			personas,
		});
		expect(Object.keys(snap.results).sort()).toEqual(["maria-2026", "nico"]);
	});

	test("per-persona errors are isolated", async () => {
		vi.mocked(aiRank)
			.mockResolvedValueOnce({ occupations: [] })
			.mockRejectedValueOnce(new Error("boom"));
		const personas = [makePersona("a"), makePersona("b")];
		const snap = await runEval({
			systemPrompt: "p",
			model: "m",
			occupations: MINIMAL_OCCUPATIONS as never,
			personas,
		});
		const a = snap.results.a as PersonaResult;
		const b = snap.results.b as PersonaResult;
		expect("error" in a).toBe(false);
		expect("error" in b).toBe(true);
		if ("error" in b) {
			expect(b.error).toBe("boom");
		}
	});

	test("empty personas array → empty results object", async () => {
		const snap = await runEval({
			systemPrompt: "p",
			model: "m",
			occupations: MINIMAL_OCCUPATIONS as never,
			personas: [],
		});
		expect(Object.keys(snap.results)).toEqual([]);
	});
});
