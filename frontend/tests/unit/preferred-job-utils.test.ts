import { describe, expect, test } from "vitest";
import {
	dedupePreferredJobs,
	isDuplicatePreferredJob,
} from "../../src/profile/preferredJobUtils";

describe("preferredJobUtils", () => {
	test("isDuplicatePreferredJob treats case variants as duplicates", () => {
		expect(isDuplicatePreferredJob(["Kosmetiker"], "kosmetiker")).toBe(true);
	});

	test("dedupePreferredJobs keeps first occurrence casing", () => {
		expect(
			dedupePreferredJobs(["Kosmetiker", "kosmetiker", "Fachinformatiker"]),
		).toEqual(["Kosmetiker", "Fachinformatiker"]);
	});
});
