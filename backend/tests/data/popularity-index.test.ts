import { describe, expect, test } from "vitest";
import {
	buildPopularityIndex,
	matchKey,
	tierForCount,
	type CatalogEntry,
	type DestatisNameRow,
} from "../../../scripts/lib/popularityIndex.js";

function entry(id: number, name: string): CatalogEntry {
	return { id, name, salaryKnown: true, degreeStats: null };
}

describe("tierForCount", () => {
	test.each([
		[5000, "A_anchor"],
		[4999, "B_solid"],
		[1000, "B_solid"],
		[999, "C_smallReal"],
		[200, "C_smallReal"],
		[199, "D_niche"],
		[50, "D_niche"],
		[49, "E_vanishing"],
		[0, "E_vanishing"],
	])("%i → %s", (count, tier) => {
		expect(tierForCount(count)).toBe(tier);
	});
});

describe("matchKey", () => {
	test.each([
		["Polsterer/Polsterin", "Polsterer/-in (IH/HwEx)"],
		["Zimmerer/Zimmerin", "Zimmerer/-in (IH/Hw)"],
		["Werkfeuerwehrmann/-frau", "Werkfeuerwehrmann/Werkfeuerwehrfrau (IH)"],
		["Änderungsschneider/in", "Änderungsschneider/-in (IH/HwEx)"],
	])("BERUFENET %s matches DAZUBI %s", (berufenet, dazubi) => {
		expect(matchKey(berufenet)).toBe(matchKey(dazubi));
	});
});

describe("buildPopularityIndex", () => {
	const dazubi = new Map([
		["Kraftfahrzeugmechatroniker/-in (IH/Hw/HwEx)", 24255],
		["Aufbereitungsmechaniker/-in (IH)", 54],
	]);
	const destatis: DestatisNameRow[] = [
		{ name: "Erzieher/in", bundesland: "Deutschland", students: 30000 },
		{ name: "Erzieher/in", bundesland: "Deutschland", students: 437 },
		{ name: "Erzieher/in", bundesland: "Berlin", students: 999999 },
		{
			name: "Kraftfahrzeugmechatroniker/in",
			bundesland: "Deutschland",
			students: 7,
		},
	];

	const index = buildPopularityIndex(
		[
			entry(1, "Kraftfahrzeugmechatroniker/in"),
			entry(2, "Aufbereitungsmechaniker/in - Braunkohle"),
			entry(3, "Erzieher/in"),
			entry(4, "Fachwirt/in - Handel (doppelt qualifizierende Ausbildung)"),
			entry(5, "Clown/in"),
		],
		dazubi,
		destatis,
	);
	const byId = new Map(index.map((r) => [r.id, r]));

	test("direct DAZUBI match wins over Destatis", () => {
		expect(byId.get(1)).toMatchObject({
			category: "dual",
			dazubiMatchType: "direct",
			dazubiContracts: 24255,
			popularityTier: "A_anchor",
		});
	});

	test("Fachrichtung falls back to its parent occupation", () => {
		expect(byId.get(2)).toMatchObject({
			category: "dual",
			dazubiMatchType: "parent",
			dazubiContracts: 54,
			popularityTier: "D_niche",
		});
	});

	test("schulisch counts sum only the Germany rows", () => {
		expect(byId.get(3)).toMatchObject({
			category: "schulisch",
			dazubiMatchType: "none",
			dazubiContracts: null,
			schulischeStudents: 30437,
			popularityTier: "A_anchor",
		});
	});

	test("unmatched doppelt qualifizierende Ausbildung → F_doppelqual", () => {
		expect(byId.get(4)).toMatchObject({
			category: "doppelqual",
			popularityTier: "F_doppelqual",
		});
	});

	test("doppelt qualifizierende Ausbildung ignores a Destatis count for its schulische namesake", () => {
		const [record] = buildPopularityIndex(
			[entry(6, "Managementassistent/in (doppelt qualifizierende Ausbildung)")],
			new Map(),
			[
				{
					name: "Managementassistent/in (schulische Ausbildung)",
					bundesland: "Deutschland",
					students: 5,
				},
			],
		);
		expect(record).toMatchObject({
			category: "doppelqual",
			popularityTier: "F_doppelqual",
		});
	});

	test("anything else → G_unknown", () => {
		expect(byId.get(5)).toMatchObject({
			category: "schulisch_or_other",
			dazubiContracts: null,
			popularityTier: "G_unknown",
		});
	});

	test("keeps catalog order and fields", () => {
		expect(index.map((r) => r.id)).toEqual([1, 2, 3, 4, 5]);
		expect(byId.get(1)).toMatchObject({
			name: "Kraftfahrzeugmechatroniker/in",
			salaryKnown: true,
			hasDegreeStats: false,
		});
	});
});
