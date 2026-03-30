import { expect, test } from "vitest";
import { makeOccupation, makeProfile } from "./helpers.js";

test("factories produce valid objects", () => {
	const occ = makeOccupation();
	expect(occ.name).toBe("Test Beruf");
	expect(occ.conditions.office).toBe(false);
	expect(occ.strengthTags).toEqual([]);

	const profile = makeProfile();
	expect(profile.strengths).toEqual({});
});
