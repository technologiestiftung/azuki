import { describe, expect, test } from "vitest";
import { buildRefreshReport } from "../../../scripts/report-data-refresh.js";
import { makeOccupation } from "../scoring/helpers.js";

const emptyContext = {
	popularityIds: new Set<number>(),
	availabilityIds: new Set<number>(),
	unmatchedExclusionIds: [],
	staleConditionOverrideIds: [],
	staleAccessOverrideIds: [],
};

function catalog(n: number) {
	return ids(range(1, n));
}

function ids(list: number[]) {
	return list.map((id) => makeOccupation({ id, name: `Beruf ${id}` }));
}

function range(from: number, to: number) {
	return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

describe("buildRefreshReport", () => {
	test("partitions added, removed and renamed occupations", () => {
		const before = [
			makeOccupation({ id: 1, name: "Bauzeichner/in" }),
			makeOccupation({ id: 2, name: "Fachlehrer/in" }),
		];
		const after = [
			makeOccupation({ id: 2, name: "Fachlehrkraft" }),
			makeOccupation({ id: 3, name: "Pflegefachassistent/in" }),
		];
		const { markdown } = buildRefreshReport(before, after, {
			...emptyContext,
			popularityIds: new Set([2]),
			availabilityIds: new Set([2]),
		});
		expect(markdown).toContain("Pflegefachassistent/in");
		expect(markdown).toContain("Bauzeichner/in");
		expect(markdown).toContain("Fachlehrer/in");
		expect(markdown).toContain("Fachlehrkraft");
	});

	test("flags a new occupation with no popularity tier and no availability", () => {
		const after = [makeOccupation({ id: 3, name: "Pflegefachassistent/in" })];
		const { markdown } = buildRefreshReport([], after, emptyContext);
		expect(markdown).toMatch(/popularity/i);
		expect(markdown).toMatch(/availability/i);
		expect(markdown).toContain("3");
	});

	test("lists missing enrichment", () => {
		const after = [
			makeOccupation({ id: 1, name: "Ohne", shortDescription: null }),
			makeOccupation({
				id: 2,
				name: "Mit",
				shortDescription: "Kurz",
				taskBullets: ["Eins"],
			}),
		];
		const { markdown } = buildRefreshReport([], after, {
			...emptyContext,
			popularityIds: new Set([1, 2]),
			availabilityIds: new Set([1, 2]),
		});
		expect(markdown).toMatch(/Missing enrichment[^\n]*: 1$/m);
		expect(markdown).toContain("Ohne");
	});

	test("surfaces stale override and exclusion ids", () => {
		const { markdown } = buildRefreshReport(catalog(1), catalog(1), {
			...emptyContext,
			popularityIds: new Set([1]),
			availabilityIds: new Set([1]),
			staleConditionOverrideIds: [4708, 14616],
			staleAccessOverrideIds: [13968],
			unmatchedExclusionIds: [999999],
		});
		expect(markdown).toContain("4708");
		expect(markdown).toContain("13968");
		expect(markdown).toContain("999999");
	});

	test("a quarter of normal churn does not block", () => {
		// The real 2026 refresh: 6 retired, 2 new, out of 538.
		const before = catalog(538);
		const after = ids([...range(7, 538), 1000, 1001]);
		expect(buildRefreshReport(before, after, emptyContext).blocking).toBeNull();
	});

	test("removals exactly at the limit do not block", () => {
		const after = ids(range(11, 100));
		expect(
			buildRefreshReport(catalog(100), after, emptyContext).blocking,
		).toBeNull();
	});

	test("removals past the limit block", () => {
		const after = ids(range(12, 100));
		expect(
			buildRefreshReport(catalog(100), after, emptyContext).blocking,
		).toMatch(/lost 11 of 100/);
	});

	test("additions cannot mask a mass retirement", () => {
		// Net size is unchanged, but 60 occupations are gone.
		const after = ids([...range(61, 538), ...range(1000, 1055)]);
		const report = buildRefreshReport(catalog(538), after, emptyContext);
		expect(report.markdown).toContain("538 → 534");
		expect(report.blocking).toMatch(/lost 60 of 538/);
	});

	test("duplicate ids cannot mask removals", () => {
		// 100 records out, but only 20 distinct ids.
		const after = [...ids(range(1, 20)), ...ids(new Array(80).fill(1))];
		expect(
			buildRefreshReport(catalog(100), after, emptyContext).blocking,
		).toMatch(/lost 80 of 100/);
	});

	test("an empty new catalog blocks", () => {
		expect(
			buildRefreshReport(catalog(100), [], emptyContext).blocking,
		).not.toBeNull();
	});

	test("growth never blocks", () => {
		expect(
			buildRefreshReport(catalog(10), catalog(500), emptyContext).blocking,
		).toBeNull();
	});
});
