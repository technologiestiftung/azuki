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

describe("scoreSnapshot — tier-only formula", () => {
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

	test("8 Tier S + 8 Tier A → 60%, concerns", () => {
		const tierS = [1, 2, 3, 4, 5, 6, 7, 8];
		const tierA = [10, 11, 12, 13, 14, 15, 16, 17];
		const persona = makePersona({ id: "p1", tierS, tierA });
		const snap = makeSnapshot({
			p1: [...tierS, ...tierA].map((id) => entry(id)),
		});
		const out = scoreSnapshot(snap, [persona]);
		expect(out.p1.percent).toBe(60);
		expect(out.p1.verdict).toBe("concerns");
		expect(out.p1.tierSCount).toBe(8);
		expect(out.p1.tierACount).toBe(8);
	});

	test("10 Tier S only (rest neutral) → 50%, concerns", () => {
		const tierS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const persona = makePersona({ id: "p1", tierS });
		const snap = makeSnapshot({
			p1: [...tierS, 99, 98, 97, 96, 95, 94, 93, 92, 91].map((id) => entry(id)),
		});
		const out = scoreSnapshot(snap, [persona]);
		expect(out.p1.percent).toBe(50);
		expect(out.p1.verdict).toBe("concerns");
	});

	test("3 Tier A only → 8%, fail (under 50)", () => {
		const persona = makePersona({ id: "p1", tierA: [10, 11, 12] });
		const snap = makeSnapshot({
			p1: [10, 11, 12, 99, 98, 97, 96, 95].map((id) => entry(id)),
		});
		const out = scoreSnapshot(snap, [persona]);
		expect(out.p1.percent).toBe(8);
		expect(out.p1.verdict).toBe("fail");
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
		expect(out.p1.percent).toBe(95);
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

	test("only 5 final entries → divides by 40 still", () => {
		const persona = makePersona({ id: "p1", tierS: [1, 2, 3, 4, 5] });
		const snap = makeSnapshot({
			p1: [1, 2, 3, 4, 5].map((id) => entry(id)),
		});
		const out = scoreSnapshot(snap, [persona]);
		expect(out.p1.percent).toBe(25);
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
