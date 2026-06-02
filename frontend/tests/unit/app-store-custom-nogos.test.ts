import { beforeEach, describe, expect, test } from "vitest";
import { useAppStore } from "../../src/store/useAppStore";
import { initialUserProfile } from "../../src/profile/initialUserProfile";

describe("useAppStore — custom no-gos", () => {
	beforeEach(() => {
		useAppStore.setState({ profile: initialUserProfile });
	});

	test("addCustomNoGo appends to catalog and marks rejected", () => {
		useAppStore.getState().addCustomNoGo("lange Pendeln");

		const { profile } = useAppStore.getState();
		expect(profile.customNoGos).toEqual(["lange Pendeln"]);
		expect(profile.noGos["lange Pendeln"]).toBe("rejected");
	});

	test("toggleCustomNoGo switches between rejected and accepted", () => {
		useAppStore.getState().addCustomNoGo("lange Pendeln");
		useAppStore.getState().toggleCustomNoGo("lange Pendeln");

		expect(useAppStore.getState().profile.noGos["lange Pendeln"]).toBe(
			"accepted",
		);

		useAppStore.getState().toggleCustomNoGo("lange Pendeln");

		expect(useAppStore.getState().profile.noGos["lange Pendeln"]).toBe(
			"rejected",
		);
	});

	test("addCustomNoGo is a no-op for duplicate catalog entries", () => {
		useAppStore.getState().addCustomNoGo("lange Pendeln");
		useAppStore.getState().addCustomNoGo("lange Pendeln");

		const { profile } = useAppStore.getState();
		expect(profile.customNoGos).toEqual(["lange Pendeln"]);
	});
});
