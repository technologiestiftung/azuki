import { describe, expect, test } from "vitest";
import type { EvalSnapshot, FinalEntry, Persona } from "@azuki/shared";
import { scoreSnapshot } from "../../src/components/eval/scoring";

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

function makePersona(
	id: string,
	tierS: number[],
	tierA: number[],
	tierC: number[],
): Persona {
	return {
		id,
		name: id,
		description: null,
		profile: baseProfile,
		tierS,
		tierA,
		tierC,
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
	test("all 8 entries Tier S → 100%, strong-pass", () => {
		const persona = makePersona("p1", [1, 2, 3, 4, 5, 6, 7, 8], [], []);
		const snap = makeSnapshot({
			p1: [1, 2, 3, 4, 5, 6, 7, 8].map((id) => entry(id)),
		});
		const out = scoreSnapshot(snap, [persona]);
		expect(out.p1.percent).toBe(100);
		expect(out.p1.verdict).toBe("strong-pass");
		expect(out.p1.tierSCount).toBe(8);
	});

	test("4 Tier S + 4 Tier A → 75%, concerns", () => {
		const persona = makePersona("p1", [1, 2, 3, 4], [10, 11, 12, 13], []);
		const snap = makeSnapshot({
			p1: [1, 2, 3, 4, 10, 11, 12, 13].map((id) => entry(id)),
		});
		const out = scoreSnapshot(snap, [persona]);
		expect(out.p1.percent).toBe(75);
		expect(out.p1.verdict).toBe("concerns");
		expect(out.p1.tierSCount).toBe(4);
		expect(out.p1.tierACount).toBe(4);
	});

	test("4 Tier S only (rest neutral) → 50%, concerns", () => {
		const persona = makePersona("p1", [1, 2, 3, 4], [], []);
		const snap = makeSnapshot({
			p1: [1, 2, 3, 4, 99, 98, 97, 96].map((id) => entry(id)),
		});
		const out = scoreSnapshot(snap, [persona]);
		expect(out.p1.percent).toBe(50);
		expect(out.p1.verdict).toBe("concerns");
	});

	test("3 Tier A only → 19%, fail (under 50)", () => {
		const persona = makePersona("p1", [], [10, 11, 12], []);
		const snap = makeSnapshot({
			p1: [10, 11, 12, 99, 98, 97, 96, 95].map((id) => entry(id)),
		});
		const out = scoreSnapshot(snap, [persona]);
		expect(out.p1.percent).toBe(19);
		expect(out.p1.verdict).toBe("fail");
	});

	test("Tier C in top 8 → fail regardless of percent", () => {
		const persona = makePersona("p1", [1, 2, 3, 4, 5, 6, 7], [], [99]);
		const snap = makeSnapshot({
			p1: [1, 2, 3, 4, 5, 6, 7, 99].map((id) => entry(id)),
		});
		const out = scoreSnapshot(snap, [persona]);
		expect(out.p1.tierCCount).toBe(1);
		expect(out.p1.verdict).toBe("fail");
		expect(out.p1.percent).toBe(88);
	});

	test("error result → all counts 0, fail, hasError true", () => {
		const persona = makePersona("p1", [1], [], []);
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

	test("only 5 final entries → divides by 16 still", () => {
		const persona = makePersona("p1", [1, 2, 3, 4, 5], [], []);
		const snap = makeSnapshot({
			p1: [1, 2, 3, 4, 5].map((id) => entry(id)),
		});
		const out = scoreSnapshot(snap, [persona]);
		expect(out.p1.percent).toBe(63);
		expect(out.p1.verdict).toBe("concerns");
	});

	test("ID in both tierS and tierC → counts as C", () => {
		const persona = makePersona("p1", [1], [], [1]);
		const snap = makeSnapshot({ p1: [entry(1)] });
		const out = scoreSnapshot(snap, [persona]);
		expect(out.p1.tierCCount).toBe(1);
		expect(out.p1.tierSCount).toBe(0);
		expect(out.p1.verdict).toBe("fail");
	});

	test("multiple personas scored independently", () => {
		const a = makePersona("a", [1, 2, 3, 4, 5, 6, 7, 8], [], []);
		const b = makePersona("b", [], [], []);
		const snap = makeSnapshot({
			a: [1, 2, 3, 4, 5, 6, 7, 8].map((id) => entry(id)),
			b: [99].map((id) => entry(id)),
		});
		const out = scoreSnapshot(snap, [a, b]);
		expect(out.a.verdict).toBe("strong-pass");
		expect(out.b.verdict).toBe("fail");
	});
});
