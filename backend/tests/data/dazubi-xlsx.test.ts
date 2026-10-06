import { beforeAll, describe, expect, test } from "vitest";
import { resolveVerifiedDazubiXlsx } from "../../../scripts/lib/dazubiSource.js";
import {
	readDazubiWorkbook,
	type DazubiWorkbookData,
} from "../../../scripts/lib/dazubiXlsx.js";

describe("readDazubiWorkbook on the pinned BIBB snapshot", () => {
	let data: DazubiWorkbookData;

	beforeAll(async () => {
		data = await readDazubiWorkbook(resolveVerifiedDazubiXlsx());
	}, 60_000);

	test("reads one row per Bundesland × Beruf and drops footnote rows", () => {
		expect(data.stateRows).toHaveLength(3299);
		expect(data.stateRows[0]).toEqual({
			bundesland: "Baden-Württemberg",
			name: "Kraftfahrzeugmechatroniker/-in (IH/Hw/HwEx)",
			anfaenger: 3042,
		});
	});

	test("reads national totals for every ranked Beruf and skips footnotes", () => {
		expect(data.nationalTotals.size).toBe(329);
		expect(
			data.nationalTotals.get("Kraftfahrzeugmechatroniker/-in (IH/Hw/HwEx)"),
		).toBe(24255);
	});
});
