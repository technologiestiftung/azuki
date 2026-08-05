import { describe, expect, test } from "vitest";
import {
	PREFERRED_JOB_EXACT_BOOST,
	PREFERRED_JOB_KEYWORD_POINT_PER_HIT,
	PREFERRED_JOB_SCORE_CAP,
	PREFERRED_JOB_SUBSTRING_BOOST,
} from "@azuki/shared";
import { preFilter } from "../../src/matching/index.js";
import {
	getBestPreferredJobTierForOccupation,
	mergeVacancyOccupationNames,
	resolvePreferredJobs,
	resolvePreferredJobsForText,
	resolvePreferredJobVacancyNames,
} from "../../src/matching/resolvePreferredJobs.js";
import { scorePreferredJobs } from "../../src/matching/score/dimensions.js";
import { makeOccupation, makeProfile } from "./helpers.js";

describe("resolvePreferredJobsForText", () => {
	test("matches gender variant via normalized name", () => {
		const occupations = [
			makeOccupation({ id: 1, name: "Kosmetiker/in (duale Ausbildung)" }),
			makeOccupation({ id: 2, name: "Maler/in und Lackierer/in" }),
		];

		const matches = resolvePreferredJobsForText("Kosmetiker", occupations);
		expect(matches.some((match) => match.occupation.id === 1)).toBe(true);
		expect(["exact", "substring"]).toContain(matches[0]?.tier);
	});

	test("matches vague media-related text via keyword tier", () => {
		const occupations = [
			makeOccupation({
				id: 10,
				name: "Mediengestalter/in - Bild und Ton",
				interestKeywords: ["Medien", "Gestaltung"],
			}),
			makeOccupation({ id: 11, name: "Kaufmann/-frau für Büromanagement" }),
		];

		const matches = resolvePreferredJobsForText(
			"irgendwas mit Medien",
			occupations,
		);
		expect(matches.some((match) => match.occupation.id === 10)).toBe(true);
		expect(matches.find((match) => match.occupation.id === 10)?.tier).toBe(
			"keyword",
		);
	});

	test("does not match unrelated Berufe via keyword substring overlap", () => {
		const occupations = [
			makeOccupation({
				id: 1,
				name: "Fleischer/in",
				interestKeywords: ["fleisch", "pflegen", "maschinen"],
			}),
			makeOccupation({
				id: 2,
				name: "Altenpflegehelfer/in",
				interestKeywords: ["pflege", "betreuung"],
			}),
		];

		const matches = resolvePreferredJobsForText(
			"ein Job in der Pflege",
			occupations,
		);
		expect(matches.map((match) => match.occupation.id)).toEqual([2]);
	});
});

describe("scorePreferredJobs", () => {
	test("returns 0 when preferredJobs is empty", () => {
		const occ = makeOccupation({ name: "Mediengestalter/in - Bild und Ton" });
		const profile = makeProfile({ preferredJobs: [] });
		expect(scorePreferredJobs(occ, profile)).toBe(0);
	});

	test("boosts exact and substring matches", () => {
		const exactOcc = makeOccupation({
			id: 1,
			name: "Mediengestalter/in - Bild und Ton",
		});
		const substringOcc = makeOccupation({
			id: 2,
			name: "Mediengestalter/in Digital und Print",
		});
		const profile = makeProfile({ preferredJobs: ["Mediengestalter"] });

		expect(scorePreferredJobs(exactOcc, profile)).toBe(
			PREFERRED_JOB_SUBSTRING_BOOST,
		);
		expect(scorePreferredJobs(substringOcc, profile)).toBe(
			PREFERRED_JOB_SUBSTRING_BOOST,
		);
	});

	test("caps total preferred-job score", () => {
		const occ = makeOccupation({
			name: "Fachinformatiker/in - Fachrichtung Anwendungsentwicklung",
		});
		const profile = makeProfile({
			preferredJobs: [
				"Fachinformatiker/in - Fachrichtung Anwendungsentwicklung",
				"Fachinformatiker",
			],
		});

		expect(scorePreferredJobs(occ, profile)).toBeLessThanOrEqual(
			PREFERRED_JOB_SCORE_CAP,
		);
		expect(scorePreferredJobs(occ, profile)).toBeGreaterThanOrEqual(
			PREFERRED_JOB_EXACT_BOOST,
		);
	});

	test("keyword tier scales with hit count", () => {
		const occ = makeOccupation({
			name: "Mediengestalter/in - Bild und Ton",
			interestKeywords: ["Medien", "Gestaltung", "Ton", "Bild"],
		});
		const profile = makeProfile({ preferredJobs: ["irgendwas mit Medien"] });
		const match = getBestPreferredJobTierForOccupation(
			occ,
			profile.preferredJobs,
		);

		expect(match?.tier).toBe("keyword");
		expect(scorePreferredJobs(occ, profile)).toBe(
			(match?.keywordHits ?? 0) * PREFERRED_JOB_KEYWORD_POINT_PER_HIT,
		);
	});
});

describe("preFilter preferred-job injection", () => {
	test("injects a resolved preferred occupation into the top shortlist", () => {
		const target = makeOccupation({
			id: 999,
			name: "Fachinformatiker/in - Fachrichtung Anwendungsentwicklung",
			interestKeywords: ["Programmierung"],
		});
		const filler = Array.from({ length: 80 }, (_, index) =>
			makeOccupation({
				id: index + 1,
				name: `Beliebter Beruf ${index + 1}`,
				interestKeywords: ["Verkauf"],
			}),
		);
		const occupations = [...filler, target];
		const profile = makeProfile({
			interests: ["computer"],
			preferredJobs: ["Fachinformatiker"],
		});

		const shortlist = preFilter(occupations, profile, 60);
		expect(shortlist.some((entry) => entry.occupation.id === 999)).toBe(true);
	});

	test("does not boost preferred occupations blocked by hard no-gos", () => {
		const occupation = makeOccupation({
			name: "Kraftfahrzeugmechatroniker/in",
			conditions: { noise: true, heavyLifting: true },
		});
		const profile = makeProfile({
			preferredJobs: ["Kraftfahrzeugmechatroniker"],
			noGos: { noise: "rejected", "heavy-work": "rejected" },
		});

		expect(scorePreferredJobs(occupation, profile)).toBe(0);
	});
});

describe("mergeVacancyOccupationNames", () => {
	test("prioritizes preferred-job names, then appends match-list names", () => {
		const merged = mergeVacancyOccupationNames(
			["Altenpfleger/in", "Gesundheits- und Krankenpfleger/in"],
			[
				"Kaufmann/-frau für Büromanagement",
				"Fachinformatiker/in - Fachrichtung Anwendungsentwicklung",
			],
		);

		expect(merged.slice(0, 2)).toEqual([
			"Altenpfleger/in",
			"Gesundheits- und Krankenpfleger/in",
		]);
		expect(merged).toContain("Kaufmann/-frau für Büromanagement");
	});

	test("dedupes preferred names against match results", () => {
		const merged = mergeVacancyOccupationNames(
			["Fachinformatiker/in - Fachrichtung Anwendungsentwicklung"],
			[
				"Fachinformatiker/in - Fachrichtung Anwendungsentwicklung",
				"Kaufmann/-frau für Büromanagement",
			],
		);

		expect(merged).toHaveLength(2);
		expect(merged[0]).toBe(
			"Fachinformatiker/in - Fachrichtung Anwendungsentwicklung",
		);
		expect(merged[1]).toBe("Kaufmann/-frau für Büromanagement");
	});
});

describe("resolvePreferredJobVacancyNames", () => {
	test("caps resolved preferred occupations and skips raw text when resolved", () => {
		const occupations = Array.from({ length: 12 }, (_, index) =>
			makeOccupation({
				id: index + 1,
				name: `Pflegeberuf ${index + 1}`,
				interestKeywords: ["Pflege"],
			}),
		);

		const names = resolvePreferredJobVacancyNames(
			["ein Job in der Pflege"],
			occupations,
		);

		expect(names.length).toBeLessThanOrEqual(5);
		expect(names).not.toContain("ein Job in der Pflege");
	});

	test("falls back to raw preferred text when nothing resolves", () => {
		const occupations = [
			makeOccupation({ id: 1, name: "Kaufmann/-frau für Büromanagement" }),
		];

		expect(
			resolvePreferredJobVacancyNames(["Quantenphysiker"], occupations),
		).toEqual(["Quantenphysiker"]);
	});
});

describe("resolvePreferredJobs", () => {
	test("dedupes occupations across multiple preferred job entries", () => {
		const occupations = [
			makeOccupation({ id: 1, name: "Kosmetiker/in (duale Ausbildung)" }),
			makeOccupation({ id: 2, name: "Kosmetiker/in (schulische Ausbildung)" }),
		];

		const resolved = resolvePreferredJobs(
			["Kosmetiker", "Kosmetiker/in"],
			occupations,
		);
		expect(resolved).toHaveLength(2);
	});

	test("sorts matches by preferred-job score descending", () => {
		const occupations = [
			makeOccupation({
				id: 1,
				name: "Mediengestalter/in - Bild und Ton",
				interestKeywords: ["Medien", "Gestaltung", "Ton", "Bild"],
			}),
			makeOccupation({ id: 2, name: "Kaufmann/-frau für Büromanagement" }),
			makeOccupation({
				id: 3,
				name: "Fachinformatiker/in - Fachrichtung Anwendungsentwicklung",
			}),
		];

		const resolved = resolvePreferredJobs(
			["Fachinformatiker", "irgendwas mit Medien"],
			occupations,
		);

		expect(resolved.map((match) => match.occupation.id)).toEqual([3, 1]);
		expect(resolved[0]?.tier).toBe("substring");
		expect(resolved[1]?.tier).toBe("keyword");
	});
});
