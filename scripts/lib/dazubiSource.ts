import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export interface DazubiSourceManifest {
	file: string;
	sha256: string;
	berichtsjahr: number;
	edition: string;
	sourceUrl: string;
	lastModified: string;
	retrievedAt: string;
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const DAZUBI_SOURCE_DIR = resolve(ROOT, "data/popularity-source");
const MANIFEST_PATH = resolve(DAZUBI_SOURCE_DIR, "dazubi-source.json");

export function sha256File(path: string): string {
	return createHash("sha256").update(readFileSync(path)).digest("hex");
}

export function readDazubiManifest(path = MANIFEST_PATH): DazubiSourceManifest {
	return JSON.parse(readFileSync(path, "utf8")) as DazubiSourceManifest;
}

export function resolveVerifiedDazubiXlsx(
	manifest: DazubiSourceManifest = readDazubiManifest(),
	dir: string = DAZUBI_SOURCE_DIR,
): string {
	const path = resolve(dir, manifest.file);
	const actual = sha256File(path);
	if (actual !== manifest.sha256) {
		throw new Error(
			`${manifest.file}: sha256 ${actual} does not match pinned ${manifest.sha256}. ` +
				"The file must stay identical to the BIBB download (CC BY-NC-ND 4.0); " +
				"see data/popularity-source/README.md to refresh it.",
		);
	}
	return path;
}
