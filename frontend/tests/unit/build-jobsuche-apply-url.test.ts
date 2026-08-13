import { describe, expect, test } from "vitest";
import { buildJobsucheApplyUrl } from "../../src/components/results-page/utils/buildJobsucheApplyUrl";

describe("buildJobsucheApplyUrl", () => {
	test("builds the arbeitsagentur.de apprenticeship search URL for a referenznummer", () => {
		expect(buildJobsucheApplyUrl("10000-1207511241-S")).toBe(
			"https://www.arbeitsagentur.de/jobsuche/suche?id=10000-1207511241-S&suchbereich=ausbildung",
		);
	});

	test("encodes special characters in the referenznummer", () => {
		expect(buildJobsucheApplyUrl("10000 1207511241 S")).toBe(
			"https://www.arbeitsagentur.de/jobsuche/suche?id=10000%201207511241%20S&suchbereich=ausbildung",
		);
	});
});
