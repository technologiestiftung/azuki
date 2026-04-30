import { describe, expect, test } from "vitest";
import type { ScoreReport, Verdict } from "@azuki/shared";

// Pure-logic unit tests for ScoreBanner rendering decisions.
// We import the helpers directly once extracted; until then these tests will fail.
import {
	getVerdictStyle,
	isUnscorable,
} from "../../src/components/eval/score-banner-helpers";

const ALL_VERDICTS: Verdict[] = ["strong-pass", "pass", "concerns", "fail"];

describe("getVerdictStyle", () => {
	test("covers all four verdict values without throwing", () => {
		for (const verdict of ALL_VERDICTS) {
			const style = getVerdictStyle(verdict);
			expect(style).toBeDefined();
			expect(typeof style.label).toBe("string");
			expect(style.label.length).toBeGreaterThan(0);
			expect(typeof style.bg).toBe("string");
			expect(typeof style.text).toBe("string");
		}
	});

	test("strong-pass label is 'STRONG PASS'", () => {
		expect(getVerdictStyle("strong-pass").label).toBe("STRONG PASS");
	});

	test("pass label is 'PASS'", () => {
		expect(getVerdictStyle("pass").label).toBe("PASS");
	});

	test("concerns label is 'CONCERNS'", () => {
		expect(getVerdictStyle("concerns").label).toBe("CONCERNS");
	});

	test("fail label is 'FAIL'", () => {
		expect(getVerdictStyle("fail").label).toBe("FAIL");
	});
});

describe("isUnscorable", () => {
	test("returns true when totalCount is 0", () => {
		const report: ScoreReport = {
			verdict: "fail",
			criteria: [],
			passedCount: 0,
			totalCount: 0,
		};
		expect(isUnscorable(report)).toBe(true);
	});

	test("returns false when totalCount > 0", () => {
		const report: ScoreReport = {
			verdict: "pass",
			criteria: [{ name: "c", passed: true, details: "ok" }],
			passedCount: 1,
			totalCount: 1,
		};
		expect(isUnscorable(report)).toBe(false);
	});

	test("returns false even with concerns verdict when totalCount > 0", () => {
		const report: ScoreReport = {
			verdict: "concerns",
			criteria: [
				{ name: "c1", passed: true, details: "ok" },
				{ name: "c2", passed: false, details: "bad" },
			],
			passedCount: 1,
			totalCount: 2,
		};
		expect(isUnscorable(report)).toBe(false);
	});
});
