import { describe, expect, test } from "vitest";
import { scoreStrengths } from "../../src/matching/score/dimensions.js";
import { makeOccupation, makeProfile } from "./helpers.js";

describe("scoreStrengths — logical-thinking", () => {
	const profile = makeProfile({
		strengths: { "logical-thinking": 0.8 },
	});

	test("awards +2 when occupation has Umsicht tag", () => {
		const occ = makeOccupation({ strengthTags: ["Umsicht"] });
		expect(scoreStrengths(occ, profile)).toBe(2);
	});

	test("does NOT award points for Sorgfalt alone", () => {
		const occ = makeOccupation({ strengthTags: ["Sorgfalt"] });
		expect(scoreStrengths(occ, profile)).toBe(0);
	});

	test("awards +2 when both Umsicht and Sorgfalt present", () => {
		const occ = makeOccupation({
			strengthTags: ["Umsicht", "Sorgfalt"],
		});
		expect(scoreStrengths(occ, profile)).toBe(2);
	});
});

describe("scoreStrengths — precision", () => {
	const profile = makeProfile({
		strengths: { precision: 0.7 },
	});

	test("awards +2 when occupation has precisionWork condition", () => {
		const occ = makeOccupation({
			conditions: { precisionWork: true },
		});
		expect(scoreStrengths(occ, profile)).toBe(2);
	});

	test("does NOT award points for Sorgfalt", () => {
		const occ = makeOccupation({
			strengthTags: ["Sorgfalt"],
		});
		expect(scoreStrengths(occ, profile)).toBe(0);
	});

	test("does NOT award points when precisionWork is false", () => {
		const occ = makeOccupation();
		expect(scoreStrengths(occ, profile)).toBe(0);
	});
});

describe("scoreStrengths — concentration", () => {
	const profile = makeProfile({
		strengths: { concentration: 0.6 },
	});

	test("awards +2 when occupation has Konzentration in skillTags", () => {
		const occ = makeOccupation({
			skillTags: ["Konzentration"],
		});
		expect(scoreStrengths(occ, profile)).toBe(2);
	});

	test("awards +2 when occupation has Daueraufmerksamkeit in skillTags", () => {
		const occ = makeOccupation({
			skillTags: ["Daueraufmerksamkeit"],
		});
		expect(scoreStrengths(occ, profile)).toBe(2);
	});

	test("does NOT award points for Sorgfalt in strengthTags", () => {
		const occ = makeOccupation({
			strengthTags: ["Sorgfalt"],
		});
		expect(scoreStrengths(occ, profile)).toBe(0);
	});

	test("does NOT award points when skillTags is empty", () => {
		const occ = makeOccupation();
		expect(scoreStrengths(occ, profile)).toBe(0);
	});
});

describe("scoreStrengths — multiple strengths score independently", () => {
	test("logical-thinking + precision + concentration can each award separately", () => {
		const profile = makeProfile({
			strengths: {
				"logical-thinking": 1.0,
				precision: 0.8,
				concentration: 0.7,
			},
		});
		const occ = makeOccupation({
			strengthTags: ["Umsicht"],
			conditions: { precisionWork: true },
			skillTags: ["Konzentration"],
		});
		expect(scoreStrengths(occ, profile)).toBe(6);
	});

	test("only awards for matching signals, not all three", () => {
		const profile = makeProfile({
			strengths: {
				"logical-thinking": 1.0,
				precision: 0.8,
				concentration: 0.7,
			},
		});
		const occ = makeOccupation({
			strengthTags: ["Umsicht", "Sorgfalt"],
		});
		expect(scoreStrengths(occ, profile)).toBe(2);
	});
});

describe("scoreStrengths — unchanged strengths still work", () => {
	test("craftsmanship still uses conditions fallback", () => {
		const profile = makeProfile({ strengths: { craftsmanship: 0.8 } });
		const occ = makeOccupation({ conditions: { manualLabor: true } });
		expect(scoreStrengths(occ, profile)).toBe(2);
	});

	test("teamwork still uses strengthTags", () => {
		const profile = makeProfile({ strengths: { teamwork: 0.8 } });
		const occ = makeOccupation({
			strengthTags: ["Befähigung zu Gruppenarbeit / Teamfähigkeit"],
		});
		expect(scoreStrengths(occ, profile)).toBe(2);
	});

	test("below-threshold strengths award nothing", () => {
		const profile = makeProfile({ strengths: { precision: 0.3 } });
		const occ = makeOccupation({ conditions: { precisionWork: true } });
		expect(scoreStrengths(occ, profile)).toBe(0);
	});
});
