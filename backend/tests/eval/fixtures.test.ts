import { describe, expect, test } from "vitest";
import { PERSONA_IDS, PERSONAS } from "@azuki/shared";
import { UserProfileSchema } from "../../src/schemas/userProfile.js";

describe("eval persona fixtures", () => {
	for (const id of PERSONA_IDS) {
		test(`${id} fixture validates against UserProfileSchema`, () => {
			const fixture = PERSONAS[id];
			const result = UserProfileSchema.safeParse(fixture);
			if (!result.success) {
				throw new Error(
					`Fixture ${id} failed schema validation:\n${JSON.stringify(result.error.issues, null, 2)}`,
				);
			}
			expect(result.success).toBe(true);
		});
	}

	test("PERSONAS contains all PERSONA_IDS", () => {
		for (const id of PERSONA_IDS) {
			expect(PERSONAS[id]).toBeDefined();
		}
	});
});
