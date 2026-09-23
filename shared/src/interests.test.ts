import { describe, expect, test } from "vitest";
import { INTERESTS } from "./interests";

const labelById = new Map(INTERESTS.map((i) => [i.id, i.dataLabel]));

describe("INTERESTS", () => {
	test("splits Mode & styling and Schrauben into single-term interests", () => {
		expect(labelById.get("fashion")).toBe("Mode");
		expect(labelById.get("styling")).toBe("Styling");
		expect(labelById.get("screwing")).toBe("Schrauben");
		expect(labelById.get("repairing")).toBe("Reparieren");
	});

	test("uses the new wording for childcare and event planning", () => {
		expect(labelById.get("babysitting")).toBe("Mit Kindern sein");
		expect(labelById.get("planning")).toBe("Events planen");
	});

	test("no longer offers the redundant nature and pet interests", () => {
		for (const id of ["fishing", "hiking", "camping", "petCare"]) {
			expect(labelById.has(id)).toBe(false);
		}
	});

	test("no data label contains an ampersand", () => {
		for (const interest of INTERESTS) {
			expect(interest.dataLabel).not.toContain("&");
		}
	});
});
