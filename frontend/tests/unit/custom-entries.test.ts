import { describe, expect, test } from "vitest";
import {
	addCustomEntry,
	removeCustomEntry,
} from "../../src/components/personas/profile-editors/custom-entries";

describe("addCustomEntry", () => {
	test("trimmed empty string is a no-op", () => {
		expect(addCustomEntry("   ", ["a"], [])).toEqual({
			all: ["a"],
			custom: [],
		});
		expect(addCustomEntry("", ["a"], [])).toEqual({ all: ["a"], custom: [] });
	});

	test("new entry appends to both arrays", () => {
		expect(addCustomEntry("Imkerei", ["a"], [])).toEqual({
			all: ["a", "Imkerei"],
			custom: ["Imkerei"],
		});
	});

	test("entry already in custom is a no-op", () => {
		expect(addCustomEntry("Imkerei", ["a", "Imkerei"], ["Imkerei"])).toEqual({
			all: ["a", "Imkerei"],
			custom: ["Imkerei"],
		});
	});

	test("entry trims whitespace before storing", () => {
		expect(addCustomEntry("  Imkerei  ", ["a"], [])).toEqual({
			all: ["a", "Imkerei"],
			custom: ["Imkerei"],
		});
	});

	test("entry already in all (predefined) but not in custom: appends to custom only", () => {
		expect(addCustomEntry("gaming", ["gaming"], [])).toEqual({
			all: ["gaming"],
			custom: ["gaming"],
		});
	});
});

describe("removeCustomEntry", () => {
	test("removes from both arrays", () => {
		expect(removeCustomEntry("Imkerei", ["a", "Imkerei"], ["Imkerei"])).toEqual(
			{ all: ["a"], custom: [] },
		);
	});

	test("non-existent entry is a no-op", () => {
		expect(removeCustomEntry("Nope", ["a"], [])).toEqual({
			all: ["a"],
			custom: [],
		});
	});
});
