import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
	resolveVerifiedDazubiXlsx,
	sha256File,
	type DazubiSourceManifest,
} from "../../../scripts/lib/dazubiSource.js";

function manifestFor(file: string, sha256: string): DazubiSourceManifest {
	return {
		file,
		sha256,
		berichtsjahr: 2024,
		edition: "test",
		sourceUrl: "https://example.org",
		lastModified: "test",
		retrievedAt: "test",
	};
}

describe("resolveVerifiedDazubiXlsx", () => {
	const dir = mkdtempSync(join(tmpdir(), "dazubi-source-"));
	writeFileSync(join(dir, "a.xlsx"), "pinned bytes");
	const sha = sha256File(join(dir, "a.xlsx"));

	test("returns the absolute path when the checksum matches", () => {
		expect(resolveVerifiedDazubiXlsx(manifestFor("a.xlsx", sha), dir)).toBe(
			join(dir, "a.xlsx"),
		);
	});

	test("throws when the file differs from the pinned checksum", () => {
		expect(() =>
			resolveVerifiedDazubiXlsx(manifestFor("a.xlsx", "0".repeat(64)), dir),
		).toThrow(/does not match pinned/);
	});

	test("the committed snapshot matches its manifest", () => {
		expect(() => resolveVerifiedDazubiXlsx()).not.toThrow();
	});
});
