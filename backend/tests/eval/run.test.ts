import { describe, expect, test, vi, beforeEach } from "vitest";
import type { EvalSnapshot, PersonaResult } from "@azuki/shared";
import { PERSONA_IDS } from "@azuki/shared";

// Mock aiRank to avoid real API calls
vi.mock("../../eval/run.js", async () => {
	// Import the real module — we need the actual runEval
	// but with aiRank mocked below
	const mod = await vi.importActual("../../eval/run.js");
	return mod;
});

vi.mock("../../src/ai/index.js", () => ({
	aiRank: vi.fn(),
}));

import { runEval } from "../../eval/run.js";
import { aiRank } from "../../src/ai/index.js";

const MINIMAL_OCCUPATIONS = [
	{
		id: 1,
		name: "Test Beruf",
		descriptionShort: null,
		descriptionLong: null,
		taskSummary: "Test task summary",
		images: [],
		degreeStats: null,
		subjects: [],
		interests: [],
		interestKeywords: [],
		strengthTags: [],
		skillTags: [],
		conditions: {
			outdoor: false,
			office: true,
			workshop: false,
			constructionSite: false,
			screenWork: false,
			manualLabor: false,
			machinery: false,
			noise: false,
			dirt: false,
			heavyLifting: false,
			heights: false,
			shiftWork: false,
			customerContact: false,
			teamwork: false,
			standingWalking: false,
			irregularHours: false,
			changingTasks: false,
			regulatedWork: false,
			animalWork: false,
			accidentRisk: false,
			precisionWork: false,
			frequentAbsence: false,
			changingWorkplaces: false,
		},
		salaryMonthlyMedian: null,
		salaryKnown: false,
		digitalizationSignal: false,
		workLocations: "",
		competenciesText: "",
	},
];

const MOCK_MATCH_RESULT = {
	occupations: [
		{
			id: 1,
			name: "Test Beruf",
			score: 0.9,
			images: [],
			taskSummary: "Test task summary",
			reasoning: "This is a good fit",
		},
	],
	generation: {
		model: "test-model",
		cost: 0.001,
		tokensInput: 100,
		tokensOutput: 50,
	},
};

describe("runEval", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("returns an EvalSnapshot with timestamp, prompt, model, and results", async () => {
		vi.mocked(aiRank).mockResolvedValue(MOCK_MATCH_RESULT);

		const snapshot = await runEval({
			systemPrompt: "test prompt",
			model: "test-model",
			occupations: MINIMAL_OCCUPATIONS,
		});

		expect(snapshot.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
		expect(snapshot.prompt).toBe("test prompt");
		expect(snapshot.model).toBe("test-model");
		expect(snapshot.results).toBeDefined();
	});

	test("returns results for all three personas", async () => {
		vi.mocked(aiRank).mockResolvedValue(MOCK_MATCH_RESULT);

		const snapshot = await runEval({
			systemPrompt: "test prompt",
			model: "test-model",
			occupations: MINIMAL_OCCUPATIONS,
		});

		for (const personaId of PERSONA_IDS) {
			expect(snapshot.results[personaId]).toBeDefined();
		}
	});

	test("each successful persona result has prefilter, final, and optional generation", async () => {
		vi.mocked(aiRank).mockResolvedValue(MOCK_MATCH_RESULT);

		const snapshot = await runEval({
			systemPrompt: "test prompt",
			model: "test-model",
			occupations: MINIMAL_OCCUPATIONS,
		});

		for (const personaId of PERSONA_IDS) {
			const result = snapshot.results[personaId] as Extract<
				PersonaResult,
				{ prefilter: unknown }
			>;
			expect(result.prefilter).toBeDefined();
			expect(result.final).toBeDefined();
			expect(Array.isArray(result.prefilter)).toBe(true);
			expect(Array.isArray(result.final)).toBe(true);
		}
	});

	test("prefilter entries have id, name, and score", async () => {
		vi.mocked(aiRank).mockResolvedValue(MOCK_MATCH_RESULT);

		const snapshot = await runEval({
			systemPrompt: "test prompt",
			model: "test-model",
			occupations: MINIMAL_OCCUPATIONS,
		});

		const nicoResult = snapshot.results["nico"] as Extract<
			PersonaResult,
			{ prefilter: unknown[] }
		>;
		if (nicoResult.prefilter.length > 0) {
			const entry = nicoResult.prefilter[0] as {
				id: unknown;
				name: unknown;
				score: unknown;
			};
			expect(typeof entry.id).toBe("number");
			expect(typeof entry.name).toBe("string");
			expect(typeof entry.score).toBe("number");
		}
	});

	test("final entries have id, name, score, and reasoning", async () => {
		vi.mocked(aiRank).mockResolvedValue(MOCK_MATCH_RESULT);

		const snapshot = await runEval({
			systemPrompt: "test prompt",
			model: "test-model",
			occupations: MINIMAL_OCCUPATIONS,
		});

		const nicoResult = snapshot.results["nico"] as Extract<
			PersonaResult,
			{ final: unknown[] }
		>;
		expect(nicoResult.final.length).toBeGreaterThan(0);
		const entry = nicoResult.final[0] as {
			id: unknown;
			name: unknown;
			score: unknown;
			reasoning: unknown;
		};
		expect(typeof entry.id).toBe("number");
		expect(typeof entry.name).toBe("string");
		expect(typeof entry.score).toBe("number");
		expect(typeof entry.reasoning).toBe("string");
	});

	test("generation info is forwarded when aiRank returns it", async () => {
		vi.mocked(aiRank).mockResolvedValue(MOCK_MATCH_RESULT);

		const snapshot = await runEval({
			systemPrompt: "test prompt",
			model: "test-model",
			occupations: MINIMAL_OCCUPATIONS,
		});

		const nicoResult = snapshot.results["nico"] as Extract<
			PersonaResult,
			{ generation: unknown }
		>;
		expect(nicoResult.generation).toEqual(MOCK_MATCH_RESULT.generation);
	});

	test("a per-persona error is captured without killing the whole run", async () => {
		vi.mocked(aiRank)
			.mockRejectedValueOnce(new Error("API error for nico"))
			.mockResolvedValue(MOCK_MATCH_RESULT);

		const snapshot = await runEval({
			systemPrompt: "test prompt",
			model: "test-model",
			occupations: MINIMAL_OCCUPATIONS,
		});

		// nico should have errored
		const nicoResult = snapshot.results["nico"] as { error: string };
		expect(nicoResult.error).toBe("API error for nico");

		// other personas should still have results
		const elinaResult = snapshot.results["elina"] as Extract<
			PersonaResult,
			{ prefilter: unknown }
		>;
		expect(elinaResult.prefilter).toBeDefined();
	});

	test("passes systemPrompt and model through to aiRank", async () => {
		vi.mocked(aiRank).mockResolvedValue(MOCK_MATCH_RESULT);

		await runEval({
			systemPrompt: "custom system prompt",
			model: "custom-model",
			occupations: MINIMAL_OCCUPATIONS,
		});

		expect(aiRank).toHaveBeenCalledWith(
			expect.any(Array),
			expect.any(Object),
			expect.objectContaining({
				systemPrompt: "custom system prompt",
				model: "custom-model",
			}),
		);
	});
});
