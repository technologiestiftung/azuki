import { describe, expect, test } from "vitest";
import { scoreEducation } from "../../src/matching/score/dimensions.js";
import { makeOccupation, makeProfile } from "./helpers.js";

describe("scoreEducation — degreeStats path (primary signal)", () => {
	test("returns 0 when occupation has no degreeStats and no accessLevel", () => {
		const profile = makeProfile({ educationLevel: "secondary" });
		const occ = makeOccupation();
		expect(scoreEducation(occ, profile)).toBe(0);
	});

	test("returns 0 when occupation's degreeStats are favorable", () => {
		// With null educationLevel defaulting to 'secondary', no penalty
		// fires when ≥10% of workers are at Hauptschule level.
		const profile = makeProfile();
		const occ = makeOccupation({
			degreeStats: {
				noQualification: 5,
				secondary: 20,
				intermediate: 50,
				universityEntrance: 25,
			},
		});
		expect(scoreEducation(occ, profile)).toBe(0);
	});

	test("-10 for secondary user when <10% of workers are secondary-or-below", () => {
		const profile = makeProfile({ educationLevel: "secondary" });
		const occ = makeOccupation({
			degreeStats: {
				noQualification: 1,
				secondary: 5,
				intermediate: 40,
				universityEntrance: 54,
			},
		});
		expect(scoreEducation(occ, profile)).toBe(-10);
	});

	test("-5 for intermediate user when <10% are intermediate-or-below", () => {
		const profile = makeProfile({ educationLevel: "intermediate" });
		const occ = makeOccupation({
			degreeStats: {
				noQualification: 0,
				secondary: 2,
				intermediate: 5,
				universityEntrance: 93,
			},
		});
		expect(scoreEducation(occ, profile)).toBe(-5);
	});

	test("degreeStats takes precedence over accessLevel when both present", () => {
		// Workforce data says 30% Hauptschule (accessible) but legal access
		// requires Realschule. The data wins.
		const profile = makeProfile({ educationLevel: "secondary" });
		const occ = makeOccupation({
			degreeStats: {
				noQualification: 5,
				secondary: 30,
				intermediate: 50,
				universityEntrance: 15,
			},
			accessLevel: "realschule",
		});
		expect(scoreEducation(occ, profile)).toBe(0);
	});
});

describe("scoreEducation — accessLevel fallback (when degreeStats is null)", () => {
	test("returns 0 when occupation has no accessLevel and no degreeStats", () => {
		const profile = makeProfile({ educationLevel: "secondary" });
		const occ = makeOccupation();
		expect(scoreEducation(occ, profile)).toBe(0);
	});

	test("no penalty when user's level meets or exceeds occupation's accessLevel", () => {
		// secondary user × unrestricted/hauptschule Beruf: gap 0 → 0
		const profile = makeProfile({ educationLevel: "secondary" });
		expect(
			scoreEducation(makeOccupation({ accessLevel: "unrestricted" }), profile),
		).toBe(0);
		expect(
			scoreEducation(makeOccupation({ accessLevel: "hauptschule" }), profile),
		).toBe(0);
	});

	test("-3 when occupation requires one tier above user level", () => {
		// secondary user × realschule Beruf: gap 1 → -3
		expect(
			scoreEducation(
				makeOccupation({ accessLevel: "realschule" }),
				makeProfile({ educationLevel: "secondary" }),
			),
		).toBe(-3);
		// intermediate user × fachhochschulreife Beruf: gap 1 → -3
		expect(
			scoreEducation(
				makeOccupation({ accessLevel: "fachhochschulreife" }),
				makeProfile({ educationLevel: "intermediate" }),
			),
		).toBe(-3);
	});

	test("-12 when occupation requires two tiers above user level", () => {
		// secondary user × fachhochschulreife Beruf: gap 2 → -12
		// (raised from -7 in May 2026 — see comment in dimensions.ts
		// accessLevelPenalty for context: FHR-vs-Hauptschule is a
		// qualitative step-change, not incremental.)
		expect(
			scoreEducation(
				makeOccupation({ accessLevel: "fachhochschulreife" }),
				makeProfile({ educationLevel: "secondary" }),
			),
		).toBe(-12);
	});

	test("-12 for foreign_degree user × fachhochschulreife Beruf (gap 2)", () => {
		// The Amira case: foreign_degree treated as tier 0 (same as
		// secondary), facing FHR-gated Berufe like Erzieher (9162) and
		// Pflegefachmann (132173). The -12 magnitude was chosen via the
		// access-penalty sweep to push these Berufe out of the
		// prefilter top-60 without affecting personas at intermediate level.
		expect(
			scoreEducation(
				makeOccupation({ accessLevel: "fachhochschulreife" }),
				makeProfile({ educationLevel: "foreign_degree" }),
			),
		).toBe(-12);
	});

	test("foreign_degree treated like secondary (lowest practical tier)", () => {
		expect(
			scoreEducation(
				makeOccupation({ accessLevel: "realschule" }),
				makeProfile({ educationLevel: "foreign_degree" }),
			),
		).toBe(-3);
	});

	test("university_entrance has no penalty on any accessLevel", () => {
		for (const level of ["unrestricted", "hauptschule", "realschule", "fachhochschulreife"] as const) {
			expect(
				scoreEducation(
					makeOccupation({ accessLevel: level }),
					makeProfile({ educationLevel: "university_entrance" }),
				),
			).toBe(0);
		}
	});

	test("unknown educationLevel → no penalty", () => {
		expect(
			scoreEducation(
				makeOccupation({ accessLevel: "fachhochschulreife" }),
				makeProfile({ educationLevel: "unknown" }),
			),
		).toBe(0);
	});
});

describe("scoreEducation — null educationLevel defaults to secondary", () => {
	// Joblinge conservative default: a user who hasn't answered the
	// education question is treated as Hauptschule-level (the realistic
	// floor for the target audience). This stops empty-profile users
	// from getting Realschule/FHR-track Berufe in their menu.

	test("null educationLevel × realschule Beruf → -3 (same as secondary)", () => {
		expect(
			scoreEducation(
				makeOccupation({ accessLevel: "realschule" }),
				makeProfile({ educationLevel: null }),
			),
		).toBe(-3);
	});

	test("null educationLevel × fachhochschulreife Beruf → -12 (same as secondary)", () => {
		expect(
			scoreEducation(
				makeOccupation({ accessLevel: "fachhochschulreife" }),
				makeProfile({ educationLevel: null }),
			),
		).toBe(-12);
	});

	test("null educationLevel × unrestricted Beruf → 0 (no penalty)", () => {
		expect(
			scoreEducation(
				makeOccupation({ accessLevel: "unrestricted" }),
				makeProfile({ educationLevel: null }),
			),
		).toBe(0);
	});

	test("null educationLevel × hauptschule Beruf → 0 (no penalty)", () => {
		expect(
			scoreEducation(
				makeOccupation({ accessLevel: "hauptschule" }),
				makeProfile({ educationLevel: null }),
			),
		).toBe(0);
	});

	test("null educationLevel × degreeStats path also fires (workforce check)", () => {
		// secondary treatment also triggers the -10 degreeStats path
		const occ = makeOccupation({
			degreeStats: {
				noQualification: 0,
				secondary: 3,
				intermediate: 50,
				universityEntrance: 47,
			},
		});
		expect(scoreEducation(occ, makeProfile({ educationLevel: null }))).toBe(
			-10,
		);
	});
});
