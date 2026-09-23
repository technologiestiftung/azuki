import { describe, expect, test } from "vitest";
import { SUBJECTS } from "./subjects";

describe("SUBJECTS", () => {
	test("no data label contains an ampersand", () => {
		for (const subject of SUBJECTS) {
			expect(subject.dataLabel).not.toContain("&");
		}
	});
});
