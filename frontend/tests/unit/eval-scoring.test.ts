import { describe, expect, test } from "vitest";
import type { EvalSnapshot, FinalEntry, Persona } from "@azuki/shared";
import { scoreSnapshot } from "../../src/components/eval/scoring";

const TOP_FINAL = 20;

const baseProfile = {
	inSchool: false,
	educationLevel: "secondary" as const,
	favoriteSubjects: [],
	customSubjects: [],
	interests: [],
	customInterests: [],
	preferredJobs: [],
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

function makePersona(opts: {
	id: string;
	tierS?: number[];
	tierA?: number[];
	tierC?: number[];
}): Persona {
	return {
		id: opts.id,
		name: opts.id,
		description: null,
		profile: baseProfile,
		tierS: opts.tierS ?? [],
		tierA: opts.tierA ?? [],
		tierC: opts.tierC ?? [],
		createdAt: "2026-04-30T00:00:00Z",
		updatedAt: "2026-04-30T00:00:00Z",
	};
}

function entry(id: number, score = 0.8): FinalEntry {
	return { id, name: `Beruf ${id}`, score, reasoning: "" };
}

function makeSnapshot(results: Record<string, FinalEntry[]>): EvalSnapshot {
	const out: EvalSnapshot = {
		timestamp: "2026-04-30T10:00:00Z",
		prompt: "p",
		model: "m",
		results: {},
	};
	for (const [id, final] of Object.entries(results)) {
		out.results[id] = { prefilter: [], final };
	}
	return out;
}

describe("scoreSnapshot — tier-only formula, per-persona denominator", () => {
	test("all 20 entries Tier S → 100%, strong-pass", () => {
		const tierS = Array.from({ length: TOP_FINAL }, (_, i) => i + 1);
		const persona = makePersona({ id: "p1", tierS });
		const snap = makeSnapshot({
			p1: tierS.map((id) => entry(id)),
		});
		const out = scoreSnapshot(snap, [persona]);
		expect(out.p1.percent).toBe(100);
		expect(out.p1.verdict).toBe("strong-pass");
		expect(out.p1.tierSCount).toBe(TOP_FINAL);
	});

	test("8 Tier S + 8 Tier A all hit → 100%, strong-pass", () => {
		const tierS = [1, 2, 3, 4, 5, 6, 7, 8];
		const tierA = [10, 11, 12, 13, 14, 15, 16, 17];
		const persona = makePersona({ id: "p1", tierS, tierA });
		const snap = makeSnapshot({
			p1: [...tierS, ...tierA].map((id) => entry(id)),
		});
		const out = scoreSnapshot(snap, [persona]);
		expect(out.p1.maxPoints).toBe(24);
		expect(out.p1.points).toBe(24);
		expect(out.p1.percent).toBe(100);
		expect(out.p1.verdict).toBe("strong-pass");
		expect(out.p1.tierSCount).toBe(8);
		expect(out.p1.tierACount).toBe(8);
	});

	test("10 Tier S all hit, remaining slots neutral → 100%", () => {
		const tierS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const persona = makePersona({ id: "p1", tierS });
		const snap = makeSnapshot({
			p1: [...tierS, 99, 98, 97, 96, 95, 94, 93, 92, 91].map((id) => entry(id)),
		});
		const out = scoreSnapshot(snap, [persona]);
		expect(out.p1.maxPoints).toBe(20);
		expect(out.p1.percent).toBe(100);
		expect(out.p1.verdict).toBe("strong-pass");
	});

	test("3 Tier A only, all hit → 100%", () => {
		const persona = makePersona({ id: "p1", tierA: [10, 11, 12] });
		const snap = makeSnapshot({
			p1: [10, 11, 12, 99, 98, 97, 96, 95].map((id) => entry(id)),
		});
		const out = scoreSnapshot(snap, [persona]);
		expect(out.p1.maxPoints).toBe(3);
		expect(out.p1.percent).toBe(100);
		expect(out.p1.verdict).toBe("strong-pass");
	});

	test("Tier C in top 20 → fail regardless of percent", () => {
		const tierS = [
			1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
		];
		const persona = makePersona({ id: "p1", tierS, tierC: [99] });
		const snap = makeSnapshot({
			p1: [...tierS, 99].map((id) => entry(id)),
		});
		const out = scoreSnapshot(snap, [persona]);
		expect(out.p1.tierCCount).toBe(1);
		expect(out.p1.verdict).toBe("fail");
		expect(out.p1.percent).toBe(100);
	});

	test("error result → all counts 0, fail, hasError true", () => {
		const persona = makePersona({ id: "p1", tierS: [1] });
		const snap: EvalSnapshot = {
			timestamp: "x",
			prompt: "x",
			model: "x",
			results: { p1: { error: "boom" } },
		};
		const out = scoreSnapshot(snap, [persona]);
		expect(out.p1.verdict).toBe("fail");
		expect(out.p1.percent).toBe(0);
		expect(out.p1.hasError).toBe(true);
	});

	test("short final list still scores against the persona ceiling", () => {
		const persona = makePersona({ id: "p1", tierS: [1, 2, 3, 4, 5] });
		const snap = makeSnapshot({
			p1: [1, 2, 3, 4, 5].map((id) => entry(id)),
		});
		const out = scoreSnapshot(snap, [persona]);
		expect(out.p1.maxPoints).toBe(10);
		expect(out.p1.percent).toBe(100);
	});

	test("grades only the slots the model actually filled", () => {
		// The ranker may answer with fewer than EVAL_TOP_N. Charging it for
		// slots it never filled deflates the score for something the rubric
		// is not measuring.
		const persona = makePersona({
			id: "p1",
			tierS: [1, 2, 3, 4, 5, 6],
			tierA: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
		});
		const snap = makeSnapshot({ p1: [1, 2, 10, 99].map((id) => entry(id)) });

		const out = scoreSnapshot(snap, [persona]);

		// 4 returned → 4 graded slots: 4 Tier S would be the best possible.
		expect(out.p1.resultCount).toBe(4);
		expect(out.p1.maxPoints).toBe(8);
		expect(out.p1.points).toBe(5);
		expect(out.p1.percent).toBe(63);
	});

	test("a full-length list is still graded across all EVAL_TOP_N slots", () => {
		const persona = makePersona({
			id: "p1",
			tierS: [1, 2, 3, 4, 5, 6],
			tierA: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
		});
		const final = Array.from({ length: TOP_FINAL }, (_, i) => entry(i + 1));
		const snap = makeSnapshot({ p1: final });

		const out = scoreSnapshot(snap, [persona]);

		expect(out.p1.resultCount).toBe(TOP_FINAL);
		expect(out.p1.maxPoints).toBe(6 * 2 + 10);
	});

	test("reports how many results were returned so a short list is visible", () => {
		const persona = makePersona({ id: "p1", tierS: [1, 2, 3] });
		const snap = makeSnapshot({ p1: [entry(1), entry(2)] });

		expect(scoreSnapshot(snap, [persona]).p1.resultCount).toBe(2);
	});

	test("misses cost points against the persona ceiling", () => {
		const persona = makePersona({
			id: "p1",
			tierS: [1, 2, 3, 4, 5, 6],
			tierA: [10, 11, 12, 13],
		});
		const snap = makeSnapshot({
			p1: [1, 2, 3, 10, 96, 97, 98, 99].map((id) => entry(id)),
		});
		const out = scoreSnapshot(snap, [persona]);
		// 8 returned → 6 Tier-S slots (12) + 2 spare Tier-A slots (2) = 14.
		expect(out.p1.maxPoints).toBe(14);
		expect(out.p1.points).toBe(7);
		expect(out.p1.percent).toBe(50);
		expect(out.p1.verdict).toBe("concerns");
	});

	test("Tier A entries beyond the free slots do not inflate the ceiling", () => {
		const tierS = Array.from({ length: 18 }, (_, i) => i + 1);
		const tierA = Array.from({ length: 30 }, (_, i) => i + 100);
		const persona = makePersona({ id: "p1", tierS, tierA });
		const final = Array.from({ length: TOP_FINAL }, (_, i) => entry(i + 1));
		const out = scoreSnapshot(makeSnapshot({ p1: final }), [persona]);
		// 18 Tier S fill 18 of the 20 slots; only 2 remain for the 30 Tier A.
		expect(out.p1.maxPoints).toBe(18 * 2 + 2);
	});

	test("an empty result list scores 0 rather than dividing by zero", () => {
		const persona = makePersona({ id: "p1", tierS: [1, 2, 3] });
		const out = scoreSnapshot(makeSnapshot({ p1: [] }), [persona]);
		expect(out.p1.resultCount).toBe(0);
		expect(out.p1.maxPoints).toBe(0);
		expect(out.p1.percent).toBe(0);
		expect(out.p1.verdict).toBe("fail");
	});

	test("persona with no tier entries scores 0 instead of dividing by zero", () => {
		const persona = makePersona({ id: "p1" });
		const out = scoreSnapshot(makeSnapshot({ p1: [entry(1)] }), [persona]);
		expect(out.p1.maxPoints).toBe(0);
		expect(out.p1.percent).toBe(0);
		expect(out.p1.verdict).toBe("fail");
	});

	test("ID in both tierS and tierC → counts as C", () => {
		const persona = makePersona({ id: "p1", tierS: [1], tierC: [1] });
		const snap = makeSnapshot({ p1: [entry(1)] });
		const out = scoreSnapshot(snap, [persona]);
		expect(out.p1.tierCCount).toBe(1);
		expect(out.p1.tierSCount).toBe(0);
		expect(out.p1.verdict).toBe("fail");
	});

	test("multiple personas scored independently", () => {
		const tierS = Array.from({ length: TOP_FINAL }, (_, i) => i + 1);
		const a = makePersona({ id: "a", tierS });
		const b = makePersona({ id: "b" });
		const snap = makeSnapshot({
			a: tierS.map((id) => entry(id)),
			b: [99].map((id) => entry(id)),
		});
		const out = scoreSnapshot(snap, [a, b]);
		expect(out.a.verdict).toBe("strong-pass");
		expect(out.b.verdict).toBe("fail");
	});
});
