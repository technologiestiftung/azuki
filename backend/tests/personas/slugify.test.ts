import { describe, expect, test } from "vitest";
import { slugify } from "../../src/personas/slugify.js";

describe("slugify", () => {
	test("simple lowercase name", () => {
		expect(slugify("Maria")).toBe("maria");
	});

	test("strips diacritics", () => {
		expect(slugify("Müller")).toBe("muller");
		expect(slugify("Łódź")).toBe("lodz");
	});

	test("spaces become dashes", () => {
		expect(slugify("Maria Tester")).toBe("maria-tester");
	});

	test("collapses consecutive whitespace and dashes", () => {
		expect(slugify("Maria   --  Tester")).toBe("maria-tester");
	});

	test("strips non-alphanumeric (except dashes)", () => {
		expect(slugify("Karim A.")).toBe("karim-a");
		expect(slugify("Nico B!")).toBe("nico-b");
	});

	test("trims leading and trailing dashes", () => {
		expect(slugify("  -hello-  ")).toBe("hello");
	});

	test("empty string returns empty", () => {
		expect(slugify("")).toBe("");
		expect(slugify("   ")).toBe("");
	});
});
