import { describe, expect, test } from "vitest";
import { scorePopularity } from "../../src/matching/score/dimensions.js";
import { makeOccupation, makeProfile } from "./helpers.js";

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

	test("neutral for F_fachpraktiker — §66 records are already hydrated from parent", () => {
		const occ = makeOccupation({ id: 4708 }); // Fachpraktiker Lagerlogistik
		expect(scorePopularity(occ)).toBe(0);
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

describe("scorePopularity — §66 Fachpraktiker (parent-aware)", () => {
	// id 4708 = Fachpraktiker für Lagerlogistik (§66 BBiG / §42r HwO)
	// Parent (27448 = Fachkraft Lagerlogistik) is A_anchor (+5).
	const fp = makeOccupation({ id: 4708, parentId: 27448 });

	test("F_fachpraktiker baseline (0) when profile is absent", () => {
		expect(scorePopularity(fp)).toBe(0);
	});

	test("F_fachpraktiker baseline (0) when educationLevel is null", () => {
		const profile = makeProfile({ educationLevel: null });
		expect(scorePopularity(fp, profile)).toBe(0);
	});

	test("parent's tier + 1 for secondary (A_anchor parent → +6)", () => {
		const profile = makeProfile({ educationLevel: "secondary" });
		expect(scorePopularity(fp, profile)).toBe(6);
	});

	test("parent's tier + 1 for foreign_degree", () => {
		const profile = makeProfile({ educationLevel: "foreign_degree" });
		expect(scorePopularity(fp, profile)).toBe(6);
	});

	test("parent's tier + 1 for none (no qualification)", () => {
		const profile = makeProfile({ educationLevel: "none" });
		expect(scorePopularity(fp, profile)).toBe(6);
	});

	test("no parent-aware lift for intermediate (Realschulabschluss)", () => {
		const profile = makeProfile({ educationLevel: "intermediate" });
		expect(scorePopularity(fp, profile)).toBe(0);
	});

	test("no parent-aware lift for extended_secondary or university_entrance", () => {
		for (const lvl of ["extended_secondary", "university_entrance"] as const) {
			const profile = makeProfile({ educationLevel: lvl });
			expect(scorePopularity(fp, profile)).toBe(0);
		}
	});

	test("scales down for §66 with B_solid parent (+2 → §66 +3)", () => {
		// id 2473 = FP Zweiradmechatroniker §66; parent 124409 = Fahrradtechnik (B_solid).
		const occ = makeOccupation({ id: 2473, parentId: 124409 });
		const profile = makeProfile({ educationLevel: "secondary" });
		expect(scorePopularity(occ, profile)).toBe(3);
	});

	test("falls back to flat +3 when §66 has no parentId (unresolved hydration)", () => {
		const occ = makeOccupation({ id: 4708, parentId: null });
		const profile = makeProfile({ educationLevel: "foreign_degree" });
		expect(scorePopularity(occ, profile)).toBe(3);
	});

	test("does not affect non-§66 Berufe regardless of profile", () => {
		// Verkäufer (A_anchor) — secondary profile should still get +5 only.
		const verkäufer = makeOccupation({ id: 6628 });
		const profile = makeProfile({ educationLevel: "secondary" });
		expect(scorePopularity(verkäufer, profile)).toBe(5);
	});
});
