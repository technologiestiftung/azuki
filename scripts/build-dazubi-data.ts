// Output is gitignored: the BIBB licence (CC BY-NC-ND 4.0) forbids sharing derived data.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
	buildAvailability,
	type Beruf,
	type DestatisRow,
} from "./build-availability.js";
import { resolveVerifiedDazubiXlsx } from "./lib/dazubiSource.js";
import { readDazubiWorkbook } from "./lib/dazubiXlsx.js";
import {
	buildPopularityIndex,
	type CatalogEntry,
	type DestatisNameRow,
} from "./lib/popularityIndex.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = resolve(ROOT, "shared/data");
const BERUFE = resolve(ROOT, "backend/src/data/berufe.json");
const DESTATIS_FIXTURE = resolve(DATA_DIR, "destatis-trainee-starts.json");

function readJson<T>(path: string): T {
	return JSON.parse(readFileSync(path, "utf8")) as T;
}

function writeJson(file: string, value: unknown) {
	writeFileSync(resolve(DATA_DIR, file), JSON.stringify(value, null, 2) + "\n");
	console.log(`  wrote shared/data/${file}`);
}

async function main() {
	const { stateRows, nationalTotals } = await readDazubiWorkbook(
		resolveVerifiedDazubiXlsx(),
	);
	const berufe = readJson<Array<CatalogEntry & Beruf>>(BERUFE);
	const destatis = readJson<Array<DestatisNameRow & DestatisRow>>(
		DESTATIS_FIXTURE,
	);

	const popularityIndex = buildPopularityIndex(
		berufe,
		nationalTotals,
		destatis,
	);
	const { availability, stats } = buildAvailability(
		berufe,
		popularityIndex,
		stateRows,
		destatis,
	);

	mkdirSync(DATA_DIR, { recursive: true });
	writeJson("popularity-index.json", popularityIndex);
	writeJson("availability-by-state.json", availability);
	console.log(
		`  DAZUBI rows matched ${stats.dazubiMatched}, unmatched ${stats.dazubiUnmatched}; ` +
			`Destatis rows matched ${stats.destatisMatched}, unmatched ${stats.destatisUnmatched}`,
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
