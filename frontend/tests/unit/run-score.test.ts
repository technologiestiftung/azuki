import { describe, expect, test } from "vitest";
import type {
	CriterionResult,
	PersonaId,
	ScoreReport,
	Verdict,
} from "@azuki/shared";
import { aggregateRunScore } from "../../src/components/eval/run-score";

function report(verdict: Verdict, passed: number, total: number): ScoreReport {
	const criteria: CriterionResult[] = [];
	for (let i = 0; i < total; i++) {
		criteria.push({
			name: `c${i}`,
			passed: i < passed,
			details: "",
		});
	}
	return { verdict, criteria, passedCount: passed, totalCount: total };
}

function reports(
	nico: ScoreReport,
	elina: ScoreReport,
	karim: ScoreReport,
): Record<PersonaId, ScoreReport> {
	return { nico, elina, karim };
}

describe("aggregateRunScore", () => {
	test("all personas pass → run pass, percent 100", () => {
		const r = reports(
			report("pass", 3, 3),
			report("pass", 6, 6),
			report("pass", 4, 4),
		);
		const score = aggregateRunScore(r);
		expect(score.verdict).toBe("pass");
		expect(score.passedCount).toBe(13);
		expect(score.totalCount).toBe(13);
		expect(score.percent).toBe(100);
	});

	test("any persona has concerns → run concerns", () => {
		const r = reports(
			report("pass", 3, 3),
			report("concerns", 4, 6),
			report("pass", 4, 4),
		);
		const score = aggregateRunScore(r);
		expect(score.verdict).toBe("concerns");
		expect(score.passedCount).toBe(11);
		expect(score.totalCount).toBe(13);
		expect(score.percent).toBe(85);
	});

	test("any persona fails → run fail regardless of others", () => {
		const r = reports(
			report("pass", 3, 3),
			report("concerns", 4, 6),
			report("fail", 0, 4),
		);
		const score = aggregateRunScore(r);
		expect(score.verdict).toBe("fail");
		expect(score.passedCount).toBe(7);
		expect(score.totalCount).toBe(13);
	});

	test("errored persona (empty criteria) → run fail, totals reflect remaining", () => {
		const r = reports(
			report("pass", 3, 3),
			report("fail", 0, 0),
			report("concerns", 2, 4),
		);
		const score = aggregateRunScore(r);
		expect(score.verdict).toBe("fail");
		expect(score.passedCount).toBe(5);
		expect(score.totalCount).toBe(7);
	});

	test("all personas errored → run fail, percent 0, totalCount 0", () => {
		const r = reports(
			report("fail", 0, 0),
			report("fail", 0, 0),
			report("fail", 0, 0),
		);
		const score = aggregateRunScore(r);
		expect(score.verdict).toBe("fail");
		expect(score.passedCount).toBe(0);
		expect(score.totalCount).toBe(0);
		expect(score.percent).toBe(0);
	});

	test("percent rounds to nearest integer", () => {
		const r = reports(
			report("fail", 0, 4),
			report("concerns", 3, 6),
			report("concerns", 1, 4),
		);
		const score = aggregateRunScore(r);
		expect(score.percent).toBe(29);
	});
});
