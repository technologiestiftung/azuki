import { describe, expect, test } from "vitest";
import { applyAccessOverrides } from "../../../scripts/apply-access-overrides.js";
import { applyConditionOverrides } from "../../../scripts/apply-condition-overrides.js";
import { makeOccupation } from "../scoring/helpers.js";

describe("applyAccessOverrides — unresolved id surfacing", () => {
	test("flags curated ids missing from the catalog", () => {
		// 14217 (Designer/in - Grafik) is a curated access override; the other
		// design-family ids are deliberately absent from this catalog slice and
		// must be reported, not silently skipped.
		const { report, unresolvedIds } = applyAccessOverrides([
			makeOccupation({ id: 14217, name: "Designer/in (Ausbildung) - Grafik" }),
		]);
		expect(report.map((r) => r.id)).toEqual([14217]);
		expect(unresolvedIds).not.toContain(14217);
		expect(unresolvedIds.length).toBeGreaterThan(0);
		expect(unresolvedIds).toContain(14869); // Gamedesigner — curated, absent here
	});

	test("applies the override to a resolved occupation", () => {
		const occ = makeOccupation({ id: 14217, accessLevel: null });
		applyAccessOverrides([occ]);
		expect(occ.accessLevel).toBe("fachhochschulreife");
	});
});

describe("applyConditionOverrides — unresolved id surfacing", () => {
	test("flags curated ids missing from the catalog", () => {
		// 27448 (Fachkraft - Lagerlogistik) is a curated condition override.
		const { report, unresolvedIds } = applyConditionOverrides([
			makeOccupation({ id: 27448, conditions: { changingWorkplaces: true } }),
		]);
		expect(report.map((r) => r.id)).toEqual([27448]);
		expect(unresolvedIds).not.toContain(27448);
		expect(unresolvedIds.length).toBeGreaterThan(0);
	});

	test("applies the patch to a resolved occupation", () => {
		const occ = makeOccupation({
			id: 27448,
			conditions: { changingWorkplaces: true },
		});
		applyConditionOverrides([occ]);
		expect(occ.conditions.changingWorkplaces).toBe(false);
	});
});
