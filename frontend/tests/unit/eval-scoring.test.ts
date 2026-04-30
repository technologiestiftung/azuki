import { describe, expect, test } from "vitest";
import type {
	Criterion,
	EvalSnapshot,
	FinalEntry,
	PersonaRubric,
	PopularityTier,
} from "@azuki/shared";
import { scoreSnapshot } from "../../src/components/eval/scoring";

function makeFinalEntry(
	id: number,
	score = 0.8,
	overrides: Partial<FinalEntry> = {},
): FinalEntry {
	return {
		id,
		name: `Beruf ${id}`,
		score,
		reasoning: `reason for ${id}`,
		...overrides,
	};
}

function makeSnapshot(
	final: { nico?: FinalEntry[]; elina?: FinalEntry[]; karim?: FinalEntry[] },
	error?: { nico?: string; elina?: string; karim?: string },
): EvalSnapshot {
	function buildResult(id: "nico" | "elina" | "karim") {
		if (error?.[id]) {
			return { error: error[id]! };
		}
		return {
			prefilter: [],
			final: final[id] ?? [],
		};
	}
	return {
		timestamp: "2026-04-30T10:00:00Z",
		prompt: "p",
		model: "m",
		results: {
			nico: buildResult("nico"),
			elina: buildResult("elina"),
			karim: buildResult("karim"),
		},
	};
}

// Helper: a one-criterion rubric that always passes / always fails.
function makeRubric(criteria: Criterion[]): PersonaRubric {
	return { tierS: [], tierA: [], tierC: [], criteria };
}

const alwaysPasses: Criterion = {
	name: "always passes",
	check: () => ({ name: "always passes", passed: true, details: "ok" }),
};

const alwaysFails: Criterion = {
	name: "always fails",
	check: () => ({ name: "always fails", passed: false, details: "no" }),
};

const hardFailIfTriggered: Criterion = {
	name: "hardFail",
	hardFail: true,
	check: (top8) => ({
		name: "hardFail",
		hardFail: true,
		passed: top8.length === 0,
		details: top8.length === 0 ? "no entries" : "had entries",
	}),
};

const noopGetTier = (_id: number): PopularityTier | undefined => undefined;

describe("scoreSnapshot", () => {
	test("all criteria pass → verdict 'pass'", () => {
		const rubric = makeRubric([alwaysPasses, alwaysPasses]);
		const snapshot = makeSnapshot({ nico: [makeFinalEntry(1)] });
		const result = scoreSnapshot(
			snapshot,
			{ nico: rubric, elina: rubric, karim: rubric },
			noopGetTier,
		);
		expect(result.nico.verdict).toBe("pass");
		expect(result.nico.passedCount).toBe(2);
		expect(result.nico.totalCount).toBe(2);
	});

	test("all criteria pass on empty top 8 → still 'pass' (no hardFail triggered)", () => {
		const rubric = makeRubric([alwaysPasses]);
		const snapshot = makeSnapshot({ nico: [] });
		const result = scoreSnapshot(
			snapshot,
			{ nico: rubric, elina: rubric, karim: rubric },
			noopGetTier,
		);
		expect(result.nico.verdict).toBe("pass");
	});

	test("one criterion fails (no hardFail) → verdict 'concerns'", () => {
		const rubric = makeRubric([alwaysPasses, alwaysFails]);
		const snapshot = makeSnapshot({ nico: [makeFinalEntry(1)] });
		const result = scoreSnapshot(
			snapshot,
			{ nico: rubric, elina: rubric, karim: rubric },
			noopGetTier,
		);
		expect(result.nico.verdict).toBe("concerns");
		expect(result.nico.passedCount).toBe(1);
		expect(result.nico.totalCount).toBe(2);
	});

	test("hardFail criterion fails → verdict 'fail' regardless of others", () => {
		const rubric = makeRubric([alwaysPasses, hardFailIfTriggered]);
		// hardFailIfTriggered fails when top8 is non-empty:
		const snapshot = makeSnapshot({ nico: [makeFinalEntry(1)] });
		const result = scoreSnapshot(
			snapshot,
			{ nico: rubric, elina: rubric, karim: rubric },
			noopGetTier,
		);
		expect(result.nico.verdict).toBe("fail");
		const hardFailResult = result.nico.criteria.find(
			(c) => c.name === "hardFail",
		);
		expect(hardFailResult?.passed).toBe(false);
	});

	test("error result for a persona → verdict 'fail' with empty criteria", () => {
		const rubric = makeRubric([alwaysPasses]);
		const snapshot = makeSnapshot({}, { nico: "boom" });
		const result = scoreSnapshot(
			snapshot,
			{ nico: rubric, elina: rubric, karim: rubric },
			noopGetTier,
		);
		expect(result.nico.verdict).toBe("fail");
		expect(result.nico.criteria).toEqual([]);
		expect(result.nico.passedCount).toBe(0);
		expect(result.nico.totalCount).toBe(0);
	});

	test("score uses top 5 for criteria that need it", () => {
		const seenAsTop5: number[][] = [];
		const captureTop5: Criterion = {
			name: "capture",
			check: (_top8, top5) => {
				seenAsTop5.push(top5.map((e) => e.id));
				return { name: "capture", passed: true, details: "" };
			},
		};
		const rubric = makeRubric([captureTop5]);
		const snapshot = makeSnapshot({
			nico: [
				makeFinalEntry(1),
				makeFinalEntry(2),
				makeFinalEntry(3),
				makeFinalEntry(4),
				makeFinalEntry(5),
				makeFinalEntry(6),
				makeFinalEntry(7),
			],
		});
		scoreSnapshot(
			snapshot,
			{ nico: rubric, elina: rubric, karim: rubric },
			noopGetTier,
		);
		expect(seenAsTop5[0]).toEqual([1, 2, 3, 4, 5]);
	});

	test("score uses only top 8 even if final has more entries", () => {
		const seenAsTop8: number[][] = [];
		const captureTop8: Criterion = {
			name: "capture",
			check: (top8) => {
				seenAsTop8.push(top8.map((e) => e.id));
				return { name: "capture", passed: true, details: "" };
			},
		};
		const rubric = makeRubric([captureTop8]);
		const snapshot = makeSnapshot({
			nico: Array.from({ length: 12 }, (_, i) => makeFinalEntry(i + 1)),
		});
		scoreSnapshot(
			snapshot,
			{ nico: rubric, elina: rubric, karim: rubric },
			noopGetTier,
		);
		expect(seenAsTop8[0]).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
	});

	test("getTier is forwarded to criteria.check", () => {
		const seenTiers: Array<PopularityTier | undefined> = [];
		const usesTier: Criterion = {
			name: "tier-aware",
			check: (top8, _top5, getTier) => {
				const tier = top8[0] ? getTier(top8[0].id) : undefined;
				seenTiers.push(tier);
				return { name: "tier-aware", passed: true, details: "" };
			},
		};
		const rubric = makeRubric([usesTier]);
		const snapshot = makeSnapshot({ nico: [makeFinalEntry(42)] });
		const fakeGetTier = (id: number): PopularityTier | undefined =>
			id === 42 ? "A_anchor" : undefined;
		scoreSnapshot(
			snapshot,
			{ nico: rubric, elina: rubric, karim: rubric },
			fakeGetTier,
		);
		expect(seenTiers[0]).toBe("A_anchor");
	});

	test("scores all three personas independently", () => {
		const passRubric = makeRubric([alwaysPasses]);
		const failRubric = makeRubric([alwaysFails]);
		const snapshot = makeSnapshot({
			nico: [makeFinalEntry(1)],
			elina: [makeFinalEntry(2)],
			karim: [makeFinalEntry(3)],
		});
		const result = scoreSnapshot(
			snapshot,
			{ nico: passRubric, elina: failRubric, karim: passRubric },
			noopGetTier,
		);
		expect(result.nico.verdict).toBe("pass");
		expect(result.elina.verdict).toBe("concerns");
		expect(result.karim.verdict).toBe("pass");
	});
});
