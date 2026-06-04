import { describe, expect, test } from "vitest";
import { scoreWorkPreferences } from "../../src/matching/score/dimensions.js";
import { makeOccupation, makeProfile } from "./helpers.js";

describe("scoreWorkPreferences — environment:a (Drinnen)", () => {
	const profile = makeProfile({ workPreferences: { environment: "a" } });

	test("matches a Beruf with indoor=true even when office/workshop are false (retail case)", () => {
		// Verkäufer/in shape: indoor workplace (Verkaufsraum), not tagged
		// office or workshop, no outdoor work. Before the indoor flag this
		// scored 0 against the Drinnen preference and lost 2 points it
		// should have earned.
		const occ = makeOccupation({
			conditions: { indoor: true, office: false, workshop: false },
		});
		expect(scoreWorkPreferences(occ, profile)).toBe(2);
	});

	test("matches the legacy office case", () => {
		const occ = makeOccupation({
			conditions: { indoor: true, office: true },
		});
		expect(scoreWorkPreferences(occ, profile)).toBe(2);
	});

	test("does not match a pure outdoor Beruf", () => {
		const occ = makeOccupation({
			conditions: { outdoor: true, indoor: false },
		});
		expect(scoreWorkPreferences(occ, profile)).toBe(0);
	});
});

describe("scoreWorkPreferences — location:a (Fester Arbeitsort)", () => {
	const profile = makeProfile({ workPreferences: { location: "a" } });

	test("matches a fixed indoor workplace even when not office/workshop", () => {
		// Fachlagerist works in Lagerhallen — fixed location, not office,
		// not workshop. Should now match the fixed-location preference.
		const occ = makeOccupation({ conditions: { indoor: true } });
		expect(scoreWorkPreferences(occ, profile)).toBe(2);
	});

	test("does not match construction-site Berufe (mobile by nature)", () => {
		const occ = makeOccupation({
			conditions: { constructionSite: true, indoor: false },
		});
		expect(scoreWorkPreferences(occ, profile)).toBe(0);
	});
});
