import { describe, expect, test } from "vitest";
import { scorePopularity } from "../../src/matching/score/dimensions.js";
import { makeOccupation } from "./helpers.js";

// IDs taken from shared/data/popularity-index.json. The test relies on these
// specific occupations keeping their tier — if a future popularity refresh
// retiers any of them, update the expected score with the new tier mapping.
describe("scorePopularity", () => {
	test("rewards A_anchor Berufe (+5) — e.g. Verkäufer/in", () => {
		const occ = makeOccupation({ id: 6628 });
		expect(scorePopularity(occ)).toBe(5);
	});

	test("rewards B_solid Berufe (+2) — e.g. Zweiradmechatroniker Fahrradtechnik", () => {
		const occ = makeOccupation({ id: 124409 });
		expect(scorePopularity(occ)).toBe(2);
	});

	test("neutral for C_smallReal Berufe — e.g. Werkfeuerwehrmann/-frau", () => {
		const occ = makeOccupation({ id: 76769 });
		expect(scorePopularity(occ)).toBe(0);
	});

	test("penalizes D_niche Berufe (-3) — e.g. Aufbereitungsmechaniker Braunkohle", () => {
		const occ = makeOccupation({ id: 27427 });
		expect(scorePopularity(occ)).toBe(-3);
	});

	test("penalizes E_vanishing Berufe (-6) — e.g. Änderungsschneider/in", () => {
		const occ = makeOccupation({ id: 33209 });
		expect(scorePopularity(occ)).toBe(-6);
	});

	test("penalizes G_unknown Berufe (-2) — e.g. Agrarwirtschaftlich-technische/r Assistent/in", () => {
		const occ = makeOccupation({ id: 6327 });
		expect(scorePopularity(occ)).toBe(-2);
	});

	test("treats off-index Berufe like G_unknown (-2)", () => {
		const occ = makeOccupation({ id: 999999999 });
		expect(scorePopularity(occ)).toBe(-2);
	});
});
