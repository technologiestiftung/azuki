import { describe, expect, test } from "vitest";
import { SUBJECT_LABELS } from "../../src/ai/labels.js";

describe("SUBJECT_LABELS", () => {
	test("no label contains an ampersand", () => {
		for (const label of Object.values(SUBJECT_LABELS)) {
			expect(label).not.toContain("&");
		}
	});
});
