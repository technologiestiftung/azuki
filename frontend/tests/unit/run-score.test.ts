import { describe, expect, test } from "vitest";
import { EVAL_TOP_N, type ScoreReport, type Verdict } from "@azuki/shared";
import { aggregateRunScore } from "../../src/components/eval/run-score";

function report(verdict: Verdict, percent: number): ScoreReport {
	return {
		verdict,
		percent,
		points: percent,
		maxPoints: 100,
		resultCount: EVAL_TOP_N,
		tierSCount: 0,
		tierACount: 0,
		tierCCount: 0,
		hasError: false,
	};
}

describe("aggregateRunScore — average of percents", () => {
	test("all personas pass → run pass, percent is average", () => {
		const r = {
			a: report("pass", 80),
			b: report("pass", 90),
			c: report("pass", 100),
		};
		const score = aggregateRunScore(r);
		expect(score.verdict).toBe("pass");
		expect(score.percent).toBe(90);
	});

	test("all personas strong-pass → run strong-pass", () => {
		const r = {
			a: report("strong-pass", 100),
			b: report("strong-pass", 100),
		};
		const score = aggregateRunScore(r);
		expect(score.verdict).toBe("strong-pass");
		expect(score.percent).toBe(100);
	});

	test("any persona has concerns → run concerns", () => {
		const r = {
			a: report("pass", 80),
			b: report("concerns", 60),
			c: report("pass", 90),
		};
		const score = aggregateRunScore(r);
		expect(score.verdict).toBe("concerns");
		expect(score.percent).toBe(77);
	});

	test("any persona fails → run fails", () => {
		const r = {
			a: report("pass", 100),
			b: report("fail", 30),
		};
		const score = aggregateRunScore(r);
		expect(score.verdict).toBe("fail");
		expect(score.percent).toBe(65);
	});

	test("empty reports → fail, 0%", () => {
		const score = aggregateRunScore({});
		expect(score.verdict).toBe("fail");
		expect(score.percent).toBe(0);
	});

	test("mix of strong-pass and pass → run pass", () => {
		const r = {
			a: report("strong-pass", 100),
			b: report("pass", 85),
		};
		const score = aggregateRunScore(r);
		expect(score.verdict).toBe("pass");
		expect(score.percent).toBe(93);
	});
});
