import { describe, expect, test } from "vitest";
import type { Persona, PrefilterEntry } from "@azuki/shared";
import { rubricReachability } from "../../src/components/eval/reachability";

function pf(id: number, name = `Beruf ${id}`, score = 0.5): PrefilterEntry {
	return { id, name, score };
}

function makePersona(overrides: Partial<Persona> = {}): Persona {
	return {
		id: "p",
		name: "p",
		description: null,
		profile: {
			inSchool: false,
			educationLevel: "secondary",
			favoriteSubjects: [],
			customSubjects: [],
			interests: [],
			customInterests: [],
			workExpectations: [],
			customWorkExpectations: [],
			strengths: {},
			customStrengths: [],
			selectedCustomStrengths: [],
			practicalExperiences: [],
			selectedPracticalExperienceIds: [],
			workPreferences: {},
			noGos: {},
			customNoGos: [],
		},
		tierS: [],
		tierA: [],
		tierC: [],
		createdAt: "x",
		updatedAt: "x",
		...overrides,
	};
}

describe("rubricReachability", () => {
	test("all Tier S present in prefilter → all reached, none missed", () => {
		const persona = makePersona({ tierS: [1, 2, 3] });
		const prefilter = [pf(1, "A"), pf(2, "B"), pf(3, "C"), pf(99, "Other")];
		const result = rubricReachability(prefilter, persona);
		expect(result.tierSReached.map((e) => e.id)).toEqual([1, 2, 3]);
		expect(result.tierSMissed).toEqual([]);
	});

	test("Tier S missing from prefilter → present in tierSMissed with name resolved", () => {
		// id 33209 is Änderungsschneider/in in POPULARITY_INDEX (first entry)
		const persona = makePersona({ tierS: [33209] });
		const prefilter = [pf(99, "Other")];
		const result = rubricReachability(prefilter, persona);
		expect(result.tierSReached).toEqual([]);
		expect(result.tierSMissed.length).toBe(1);
		expect(result.tierSMissed[0].id).toBe(33209);
		expect(result.tierSMissed[0].name).toBe("Änderungsschneider/in");
	});

	test("Tier S missing from prefilter AND from POPULARITY_INDEX → name falls back to placeholder", () => {
		const persona = makePersona({ tierS: [999999999] }); // not a real ID
		const prefilter: PrefilterEntry[] = [];
		const result = rubricReachability(prefilter, persona);
		expect(result.tierSMissed.length).toBe(1);
		expect(result.tierSMissed[0].id).toBe(999999999);
		// Don't crash; provide a placeholder.
		expect(result.tierSMissed[0].name).toContain("999999999");
	});

	test("Tier C present in prefilter → tierCInPrefilter populated with rank", () => {
		const persona = makePersona({ tierC: [10, 20] });
		const prefilter = [pf(99, "Other"), pf(10, "BadBeruf"), pf(20, "AlsoBad")];
		const result = rubricReachability(prefilter, persona);
		expect(result.tierCInPrefilter.length).toBe(2);
		expect(result.tierCInPrefilter[0]).toEqual({
			id: 10,
			name: "BadBeruf",
			rank: 2,
		});
		expect(result.tierCInPrefilter[1]).toEqual({
			id: 20,
			name: "AlsoBad",
			rank: 3,
		});
	});

	test("rank is 1-indexed from prefilter order", () => {
		const persona = makePersona({ tierS: [42] });
		const prefilter = [pf(1), pf(2), pf(42, "Hit"), pf(4)];
		const result = rubricReachability(prefilter, persona);
		expect(result.tierSReached[0].rank).toBe(3);
	});

	test("counts match the source arrays", () => {
		const persona = makePersona({
			tierS: [1, 2, 3, 4, 5],
			tierC: [10, 11],
		});
		const prefilter = [pf(1), pf(2), pf(10)];
		const result = rubricReachability(prefilter, persona);
		expect(result.tierSTotal).toBe(5);
		expect(result.tierSReached.length).toBe(2);
		expect(result.tierSMissed.length).toBe(3);
		expect(result.tierCInPrefilter.length).toBe(1);
	});

	test("empty persona → empty results, no crash", () => {
		const persona = makePersona();
		const prefilter = [pf(1), pf(2)];
		const result = rubricReachability(prefilter, persona);
		expect(result.tierSReached).toEqual([]);
		expect(result.tierSMissed).toEqual([]);
		expect(result.tierCInPrefilter).toEqual([]);
		expect(result.tierSTotal).toBe(0);
	});
});
