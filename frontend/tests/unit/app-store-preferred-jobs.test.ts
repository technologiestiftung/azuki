import { beforeEach, describe, expect, test } from "vitest";
import { useAppStore } from "../../src/store/useAppStore";
import { initialUserProfile } from "../../src/profile/initialUserProfile";

describe("useAppStore — preferred jobs", () => {
	beforeEach(() => {
		useAppStore.setState({ profile: initialUserProfile });
	});

	test("addPreferredJobs ignores case-insensitive duplicates", () => {
		useAppStore.getState().addPreferredJobs(["Kosmetiker"]);
		useAppStore.getState().addPreferredJobs(["kosmetiker"]);

		expect(useAppStore.getState().profile.preferredJobs).toEqual([
			"Kosmetiker",
		]);
	});
});
