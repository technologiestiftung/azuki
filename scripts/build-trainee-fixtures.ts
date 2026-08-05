/**
 * Reads the two yearly xlsx snapshots and writes slim JSON fixtures
 * consumed by scripts/build-availability.ts.
 *
 * Run rarely — only when refreshing snapshots. Pure Node + exceljs;
 * no Python or external runtime needed.
 *
 * The xlsx are too large to commit: download them once into
 * data/popularity-source/ (see the README there), or point
 * POPULARITY_DATA_DIR at wherever you keep them.
 *
 * Usage: npm run data:build-trainee-fixtures
 */

import ExcelJS, { type CellValue } from "exceljs";
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { isBundesland } from "@azuki/shared";
import { normalizeKldb } from "./normalizeKldb.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function logSkipped(source: string, skipped: Map<string, number>) {
	if (skipped.size === 0) return;
	const summary = [...skipped.entries()].map(([k, v]) => `${k}=${v}`).join(", ");
	console.log(`  ${source} skipped non-Bundesland rows: ${summary}`);
}
const SOURCE_DIR = process.env.POPULARITY_DATA_DIR
	? resolve(process.env.POPULARITY_DATA_DIR)
	: resolve(ROOT, "data/popularity-source");
const DAZUBI_XLSX = resolve(SOURCE_DIR, "dazubi-all-berufe-2024.xlsx");
const DESTATIS_XLSX = resolve(SOURCE_DIR, "destatis-2024-25.xlsx");

const SOURCES = [
	{
		path: DAZUBI_XLSX,
		origin: "BIBB DAZUBI 2024 — https://www.bibb.de/dazubi",
		where: 'Auswertungen → Tabellen → "Alle Berufe nach Ländern"',
	},
	{
		path: DESTATIS_XLSX,
		origin:
			"Destatis, Berufliche Schulen 2024/25 — https://www-genesis.destatis.de",
		where: "tables 21121-10, -11, -12, -13",
	},
];

function assertSourcesPresent() {
	const missing = SOURCES.filter((s) => !existsSync(s.path));
	if (missing.length === 0) return;
	const details = missing
		.map((s) => `  ${s.path}\n    ${s.origin}\n    ${s.where}`)
		.join("\n");
	throw new Error(
		`Missing xlsx snapshot(s) — they are not in git, download them once:\n${details}\n\n` +
			`Then re-run, or set POPULARITY_DATA_DIR to the directory holding them.`,
	);
}
const OUT_DAZUBI = resolve(ROOT, "shared/data/dazubi-trainee-starts.json");
const OUT_DESTATIS = resolve(ROOT, "shared/data/destatis-trainee-starts.json");

interface DazubiRow {
	bundesland: string;
	name: string;
	anfaenger: number;
}
interface DestatisRow {
	germanOccupationCode: string;
	bundesland: string;
	students: number;
}

const DESTATIS_SHEETS = [
	"csv-21121-10",
	"csv-21121-11",
	"csv-21121-12",
	"csv-21121-13",
];

/** Coerces an exceljs CellValue to a plain string. Unwraps formula and rich-text wrappers; returns "" for null/undefined. */
function cellString(v: CellValue): string {
	if (v === null || v === undefined) return "";
	if (typeof v === "string") return v;
	if (typeof v === "number" || typeof v === "boolean") return String(v);
	if (v instanceof Date) return v.toISOString();
	if (typeof v === "object") {
		if ("result" in v && v.result !== undefined)
			return cellString(v.result as CellValue);
		if ("richText" in v && Array.isArray(v.richText)) {
			return v.richText.map((r) => r.text).join("");
		}
		if ("text" in v && typeof v.text === "string") return v.text;
	}
	return String(v);
}

/** Coerces an exceljs CellValue to an integer count. Returns 0 for null/undefined, '-', '·', non-numeric strings. */
function cellCount(v: CellValue): number {
	if (v === null || v === undefined) return 0;
	if (typeof v === "number") return Math.trunc(v);
	if (typeof v === "string") {
		if (v === "-" || v === "·") return 0;
		const n = parseInt(v, 10);
		return Number.isFinite(n) ? n : 0;
	}
	if (typeof v === "object" && v !== null && "result" in v) {
		return cellCount(v.result as CellValue);
	}
	return 0;
}

async function readDazubi(): Promise<DazubiRow[]> {
	const wb = new ExcelJS.Workbook();
	await wb.xlsx.readFile(DAZUBI_XLSX);
	const ws = wb.getWorksheet("Alle Berufe nach Ländern");
	if (!ws) throw new Error("DAZUBI sheet 'Alle Berufe nach Ländern' not found");

	const rows: DazubiRow[] = [];
	const skipped = new Map<string, number>();
	ws.eachRow({ includeEmpty: false }, (row, rowNum) => {
		// Header is rows 1–5; data starts at row 6 (matches openpyxl min_row=6).
		if (rowNum < 6) return;
		const bundesland = cellString(row.getCell(1).value);
		const name = cellString(row.getCell(3).value);
		const anfaenger = cellCount(row.getCell(4).value);
		if (!bundesland || !name || anfaenger <= 0) return;
		if (!isBundesland(bundesland)) {
			skipped.set(bundesland, (skipped.get(bundesland) ?? 0) + 1);
			return;
		}
		rows.push({ bundesland, name: name.trim(), anfaenger });
	});
	logSkipped("DAZUBI", skipped);
	return rows;
}

async function readDestatis(): Promise<DestatisRow[]> {
	const wb = new ExcelJS.Workbook();
	await wb.xlsx.readFile(DESTATIS_XLSX);
	const rows: DestatisRow[] = [];
	const skipped = new Map<string, number>();

	for (const sheetName of DESTATIS_SHEETS) {
		const ws = wb.getWorksheet(sheetName);
		if (!ws) continue;

		// exceljs returns a 1-based array with leading undefined at index 0.
		const headerValues = ws.getRow(1).values as (CellValue | undefined)[];
		const cols = new Map<string, number>();
		headerValues.forEach((v, i) => {
			if (typeof v === "string") cols.set(v, i);
		});

		const ztKey = cols.has("Zeitform_des_Unterrichts")
			? "Zeitform_des_Unterrichts"
			: cols.has("Zeitform")
				? "Zeitform"
				: null;

		const getCol = (key: string): number => {
			const c = cols.get(key);
			if (c === undefined)
				throw new Error(`column '${key}' missing in ${sheetName}`);
			return c;
		};
		const colGeschlecht = getCol("Geschlecht");
		const colKlassenstufe = getCol("Klassenstufe");
		const colKldb = getCol("Kldb_2010");
		const colName = getCol("Berufs_Bezeichnung");
		const colCount = getCol("Schueler_innen_Anzahl");
		const colBundesland = getCol("Bundesland");
		const colZeitform = ztKey ? getCol(ztKey) : null;

		ws.eachRow({ includeEmpty: false }, (row, rowNum) => {
			if (rowNum < 2) return;

			if (cellString(row.getCell(colGeschlecht).value) !== "Zusammen") return;
			if (
				colZeitform !== null &&
				cellString(row.getCell(colZeitform).value) !== "Insgesamt"
			)
				return;
			if (
				cellString(row.getCell(colKlassenstufe).value) !== "1. Schuljahrgang"
			)
				return;

			const kldbRaw = cellString(row.getCell(colKldb).value);
			const nameRaw = cellString(row.getCell(colName).value);
			if (kldbRaw === "Insgesamt" || nameRaw === "Insgesamt") return;

			const germanOccupationCode = normalizeKldb(kldbRaw);
			if (!germanOccupationCode) return;

			const count = cellCount(row.getCell(colCount).value);
			if (count <= 0) return;

			const bundesland = cellString(row.getCell(colBundesland).value);
			if (!isBundesland(bundesland)) {
				skipped.set(bundesland, (skipped.get(bundesland) ?? 0) + 1);
				return;
			}

			rows.push({
				germanOccupationCode,
				bundesland,
				students: count,
			});
		});
	}

	logSkipped("Destatis", skipped);
	return rows;
}

async function main() {
	assertSourcesPresent();
	console.log("Reading xlsx via exceljs...");
	const dazubi = await readDazubi();
	const destatis = await readDestatis();
	console.log(
		`  ${dazubi.length} DAZUBI rows, ${destatis.length} Destatis rows`,
	);

	mkdirSync(dirname(OUT_DAZUBI), { recursive: true });
	writeFileSync(OUT_DAZUBI, JSON.stringify(dazubi, null, 2) + "\n");
	writeFileSync(OUT_DESTATIS, JSON.stringify(destatis, null, 2) + "\n");
	console.log(`Wrote ${OUT_DAZUBI}`);
	console.log(`Wrote ${OUT_DESTATIS}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
