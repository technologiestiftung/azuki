import type { CellValue } from "exceljs";

/** Coerces an exceljs CellValue to a plain string. Unwraps formula and rich-text wrappers; returns "" for null/undefined. */
export function cellString(v: CellValue): string {
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
export function cellCount(v: CellValue): number {
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
