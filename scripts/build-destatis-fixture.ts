// Download instructions for the gitignored xlsx: data/popularity-source/README.md.

import ExcelJS, { type CellValue } from "exceljs";
import { existsSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isBundesland } from "@azuki/shared";
import { normalizeKldb } from "./normalizeKldb.js";
import { cellCount, cellString } from "./lib/excelCells.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = process.env.POPULARITY_DATA_DIR
	? resolve(process.env.POPULARITY_DATA_DIR)
	: resolve(ROOT, "data/popularity-source");
const DESTATIS_XLSX = resolve(SOURCE_DIR, "destatis-2024-25.xlsx");
const OUT = resolve(ROOT, "shared/data/destatis-trainee-starts.json");
const SHEETS = ["csv-21121-10", "csv-21121-11", "csv-21121-12", "csv-21121-13"];
const NATIONAL = "Deutschland";

interface DestatisRow {
	germanOccupationCode: string;
	name: string;
	bundesland: string;
	students: number;
}

async function readDestatis(): Promise<DestatisRow[]> {
	const wb = new ExcelJS.Workbook();
	await wb.xlsx.readFile(DESTATIS_XLSX);
	const rows: DestatisRow[] = [];

	for (const sheetName of SHEETS) {
		const ws = wb.getWorksheet(sheetName);
		if (!ws) throw new Error(`Destatis sheet '${sheetName}' not found`);

		const headerValues = ws.getRow(1).values as (CellValue | undefined)[];
		const cols = new Map<string, number>();
		headerValues.forEach((v, i) => {
			if (typeof v === "string") cols.set(v, i);
		});
		const getCol = (key: string): number => {
			const c = cols.get(key);
			if (c === undefined)
				throw new Error(`column '${key}' missing in ${sheetName}`);
			return c;
		};
		const ztKey = cols.has("Zeitform_des_Unterrichts")
			? "Zeitform_des_Unterrichts"
			: cols.has("Zeitform")
				? "Zeitform"
				: null;
		const colGeschlecht = getCol("Geschlecht");
		const colKlassenstufe = getCol("Klassenstufe");
		const colKldb = getCol("Kldb_2010");
		const colName = getCol("Berufs_Bezeichnung");
		const colCount = getCol("Schueler_innen_Anzahl");
		const colBundesland = getCol("Bundesland");
		const colZeitform = ztKey ? getCol(ztKey) : null;

		ws.eachRow({ includeEmpty: false }, (row, rowNum) => {
			if (rowNum < 2) return;
			const text = (col: number) => cellString(row.getCell(col).value);
			if (text(colGeschlecht) !== "Zusammen") return;
			if (colZeitform !== null && text(colZeitform) !== "Insgesamt") return;
			if (text(colKlassenstufe) !== "1. Schuljahrgang") return;

			const kldbRaw = text(colKldb);
			const name = text(colName).trim();
			if (kldbRaw === "Insgesamt" || name === "Insgesamt") return;
			const germanOccupationCode = normalizeKldb(kldbRaw);
			if (!germanOccupationCode) return;

			const students = cellCount(row.getCell(colCount).value);
			if (students <= 0) return;

			const bundesland = text(colBundesland);
			if (!isBundesland(bundesland) && bundesland !== NATIONAL) return;

			rows.push({ germanOccupationCode, name, bundesland, students });
		});
	}
	return rows;
}

async function main() {
	if (!existsSync(DESTATIS_XLSX)) {
		throw new Error(
			`Missing ${DESTATIS_XLSX}. Download it as described in data/popularity-source/README.md, ` +
				"or set POPULARITY_DATA_DIR to the directory holding it.",
		);
	}
	const rows = await readDestatis();
	writeFileSync(OUT, JSON.stringify(rows, null, 2) + "\n");
	console.log(`Wrote ${rows.length} rows to ${OUT}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
