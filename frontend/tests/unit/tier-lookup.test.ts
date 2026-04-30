import { describe, expect, test } from "vitest";
import type { PersonaRubric } from "@azuki/shared";
import { getRubricTier } from "../../src/components/eval/tier-lookup";

const rubric: PersonaRubric = {
	tierS: [1, 2],
	tierA: [10, 11],
	tierC: [100, 101],
	criteria: [],
};

describe("getRubricTier", () => {
	test("returns S for IDs in tierS", () => {
		expect(getRubricTier(1, rubric)).toBe("S");
		expect(getRubricTier(2, rubric)).toBe("S");
	});

	test("returns A for IDs in tierA", () => {
		expect(getRubricTier(10, rubric)).toBe("A");
		expect(getRubricTier(11, rubric)).toBe("A");
	});

	test("returns C for IDs in tierC", () => {
		expect(getRubricTier(100, rubric)).toBe("C");
		expect(getRubricTier(101, rubric)).toBe("C");
	});

	test("returns undefined for IDs in no tier", () => {
		expect(getRubricTier(999, rubric)).toBeUndefined();
	});

	test("ID present in multiple tiers — S wins over A wins over C", () => {
		const odd: PersonaRubric = {
			tierS: [42],
			tierA: [42],
			tierC: [42],
			criteria: [],
		};
		expect(getRubricTier(42, odd)).toBe("S");
	});
});
