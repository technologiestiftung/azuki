import { describe, expect, test } from "vitest";
import { scoreInterests } from "../../src/matching/score/dimensions.js";
import { makeOccupation, makeProfile } from "./helpers.js";

describe("scoreInterests — kreativ-gestaltend category", () => {
	const profile = makeProfile({ interests: ["drawing"] });

	test("matches via kreativ-gestaltend interest tag", () => {
		const occ = makeOccupation({ interests: ["kreativ-gestaltend"] });
		expect(scoreInterests(occ, profile)).toBe(3);
	});

	test("matches via creativity skill tags when interest tag is absent", () => {
		const occ = makeOccupation({
			skillTags: ["Zeichnerische Befähigung"],
		});
		expect(scoreInterests(occ, profile)).toBe(1);
	});

	test("does not match unrelated Berufe", () => {
		const occ = makeOccupation({
			interests: ["praktisch-konkret"],
			conditions: { customerContact: true },
		});
		expect(scoreInterests(occ, profile)).toBe(0);
	});
});
