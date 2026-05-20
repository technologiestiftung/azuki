import { afterEach, describe, expect, test, vi } from "vitest";
import { normalizeKldb } from "../../../scripts/normalizeKldb.js";

describe("normalizeKldb", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	test("returns null for nullish or empty input", () => {
		expect(normalizeKldb(undefined)).toBeNull();
		expect(normalizeKldb("")).toBeNull();
		expect(normalizeKldb("   ")).toBeNull();
	});

	test("returns clean numeric code unchanged", () => {
		expect(normalizeKldb("12345")).toBe("12345");
	});

	test("strips the BERUFENET 'B ' agency prefix", () => {
		expect(normalizeKldb("B 12345")).toBe("12345");
		expect(normalizeKldb("B\t12345")).toBe("12345");
	});

	test("collapses internal whitespace", () => {
		expect(normalizeKldb("1 2 3 4 5")).toBe("12345");
	});

	test("warns when the result is non-numeric (upstream API shape changed)", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const result = normalizeKldb("XYZ123");
		expect(result).toBe("XYZ123");
		expect(warn).toHaveBeenCalledOnce();
		expect(warn.mock.calls[0]?.[0]).toContain("XYZ123");
	});

	test("does NOT warn for clean numeric codes", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		normalizeKldb("12345");
		normalizeKldb("B 12345");
		expect(warn).not.toHaveBeenCalled();
	});
});
