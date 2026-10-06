import ExcelJS from "exceljs";
import { isBundesland, type Bundesland } from "@azuki/shared";
import { cellCount, cellString } from "./excelCells.js";

export interface DazubiStateRow {
	bundesland: Bundesland;
	name: string;
	anfaenger: number;
}

export interface DazubiWorkbookData {
	stateRows: DazubiStateRow[];
	nationalTotals: Map<string, number>;
}

const STATE_SHEET = "Alle Berufe nach Ländern";
const NATIONAL_SHEET = "Alle Berufe (BBiG bzw. HwO) D ";
const FIRST_DATA_ROW = 6;

export async function readDazubiWorkbook(
	path: string,
): Promise<DazubiWorkbookData> {
	const wb = new ExcelJS.Workbook();
	await wb.xlsx.readFile(path);
	return {
		stateRows: readStateRows(sheet(wb, STATE_SHEET)),
		nationalTotals: readNationalTotals(sheet(wb, NATIONAL_SHEET)),
	};
}

function sheet(wb: ExcelJS.Workbook, name: string): ExcelJS.Worksheet {
	const ws = wb.getWorksheet(name);
	if (!ws) throw new Error(`DAZUBI sheet '${name}' not found`);
	return ws;
}

function readStateRows(ws: ExcelJS.Worksheet): DazubiStateRow[] {
	const rows: DazubiStateRow[] = [];
	ws.eachRow({ includeEmpty: false }, (row, rowNum) => {
		if (rowNum < FIRST_DATA_ROW) return;
		const bundesland = cellString(row.getCell(1).value);
		const name = cellString(row.getCell(3).value).trim();
		const anfaenger = cellCount(row.getCell(4).value);
		if (!isBundesland(bundesland) || !name || anfaenger <= 0) return;
		rows.push({ bundesland, name, anfaenger });
	});
	return rows;
}

// Footnotes under the table are merged across columns, so only rows with a numeric rank are data.
function readNationalTotals(ws: ExcelJS.Worksheet): Map<string, number> {
	const totals = new Map<string, number>();
	ws.eachRow({ includeEmpty: false }, (row, rowNum) => {
		if (rowNum < FIRST_DATA_ROW) return;
		if (typeof row.getCell(1).value !== "number") return;
		const name = cellString(row.getCell(2).value).trim();
		if (name) totals.set(name, cellCount(row.getCell(3).value));
	});
	return totals;
}
