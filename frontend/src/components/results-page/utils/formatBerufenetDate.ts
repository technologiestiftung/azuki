import { BERUFENET_FETCHED_AT } from "@azuki/shared";

/** Formats the BERUFENET fetch date as "MM/YY", e.g. "2026-09-21" → "09/26". */
export function formatBerufenetDate(isoDate: string = BERUFENET_FETCHED_AT) {
	const [year, month] = isoDate.split("-");
	return `${month}/${year.slice(2)}`;
}
