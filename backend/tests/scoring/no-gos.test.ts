import { describe, expect, test } from "vitest";
import { scoreNoGos } from "../../src/matching/score/dimensions.js";
import { makeOccupation, makeProfile } from "./helpers.js";

describe("scoreNoGos — basic penalties", () => {
	test("returns 0 when no no-gos are active", () => {
		const profile = makeProfile();
		const occ = makeOccupation({ conditions: { noise: true, dirt: true } });
		expect(scoreNoGos(occ, profile)).toBe(0);
	});

	test("applies -5 per matched no-go", () => {
		const profile = makeProfile({
			noGos: { noise: "rejected", dirt: "rejected" },
		});
		// Industrial occupation: noise + machinery, no social interest dominance.
		const occ = makeOccupation({
			conditions: { noise: true, dirt: true, machinery: true },
			interests: ["praktisch-konkret"],
		});
		expect(scoreNoGos(occ, profile)).toBe(-10);
	});

	test("ignores no-gos the user didn't reject", () => {
		const profile = makeProfile({ noGos: { noise: undefined } });
		const occ = makeOccupation({
			conditions: { noise: true, machinery: true },
		});
		expect(scoreNoGos(occ, profile)).toBe(0);
	});
});

describe("scoreNoGos — soft noise penalty for people-environment Berufe", () => {
	const profile = makeProfile({ noGos: { noise: "rejected" } });

	test("applies -1 (not -5) when noise comes from social/care environment", () => {
		// Erzieher / Sozialpädagogische Assistent shape: dominant
		// sozial-beratend, no machinery — the BERUFENET 'noise' tag here
		// is Kindergartenalltag, not industrial.
		const occ = makeOccupation({
			conditions: { noise: true, machinery: false },
			interests: ["sozial-beratend", "praktisch-konkret"],
		});
		expect(scoreNoGos(occ, profile)).toBe(-1);
	});

	test("applies full -5 to industrial Berufe (machinery present) even if sozial-beratend appears", () => {
		const occ = makeOccupation({
			conditions: { noise: true, machinery: true },
			interests: ["sozial-beratend", "praktisch-konkret"],
		});
		expect(scoreNoGos(occ, profile)).toBe(-5);
	});

	test("applies full -5 when sozial-beratend isn't a dominant interest", () => {
		// Industrial Beruf where sozial-beratend appears at index 2+
		// — not where the work happens, so noise is still industrial.
		const occ = makeOccupation({
			conditions: { noise: true, machinery: false },
			interests: [
				"praktisch-konkret",
				"verwaltend-organisatorisch",
				"sozial-beratend",
			],
		});
		expect(scoreNoGos(occ, profile)).toBe(-5);
	});

	test("the soft penalty is specific to softenable no-gos; other no-gos remain -5", () => {
		const profile2 = makeProfile({
			noGos: { noise: "rejected", dirt: "rejected" },
		});
		const occ = makeOccupation({
			conditions: { noise: true, dirt: true, machinery: false },
			interests: ["sozial-beratend"],
		});
		// noise softened to -1, dirt full -5
		expect(scoreNoGos(occ, profile2)).toBe(-6);
	});
});

describe("scoreNoGos — soft heavy-work penalty for people-care Berufe", () => {
	const profile = makeProfile({ noGos: { "heavy-work": "rejected" } });

	test("applies -1 (not -5) when heavyLifting is care-context patient transfers", () => {
		// Altenpflegehelfer / GuK-Helfer shape: dominant sozial-beratend,
		// no machinery — BERUFENET tags lifting/transferring patients as
		// heavyLifting, but this is the Joblinge-target work, not
		// industrial/Werkstatt lifting.
		const occ = makeOccupation({
			conditions: { heavyLifting: true, machinery: false },
			interests: ["sozial-beratend", "praktisch-konkret"],
		});
		expect(scoreNoGos(occ, profile)).toBe(-1);
	});

	test("applies full -5 to industrial Berufe even if sozial-beratend appears", () => {
		const occ = makeOccupation({
			conditions: { heavyLifting: true, machinery: true },
			interests: ["sozial-beratend", "praktisch-konkret"],
		});
		expect(scoreNoGos(occ, profile)).toBe(-5);
	});

	test("applies full -5 when sozial-beratend isn't a dominant interest", () => {
		const occ = makeOccupation({
			conditions: { heavyLifting: true, machinery: false },
			interests: ["praktisch-konkret", "verwaltend-organisatorisch"],
		});
		expect(scoreNoGos(occ, profile)).toBe(-5);
	});
});
