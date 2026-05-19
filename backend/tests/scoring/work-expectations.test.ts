import { describe, expect, test } from "vitest";
import { scoreWorkExpectations } from "../../src/matching/score/dimensions.js";
import { makeOccupation, makeProfile } from "./helpers.js";

describe("scoreWorkExpectations — remote", () => {
	const profile = makeProfile({ workExpectations: ["remote"] });

	test("awards +2 when workLocations contains Homeoffice", () => {
		const occ = makeOccupation({
			workLocations: "in Büroräumen im Homeoffice bzw. mobil",
		});
		expect(scoreWorkExpectations(occ, profile)).toBe(2);
	});

	test("awards +2 case-insensitive", () => {
		const occ = makeOccupation({
			workLocations: "im HOMEOFFICE",
		});
		expect(scoreWorkExpectations(occ, profile)).toBe(2);
	});

	test("does NOT award when workLocations has no Homeoffice", () => {
		const occ = makeOccupation({
			workLocations: "in Werkstätten in Produktionshallen",
		});
		expect(scoreWorkExpectations(occ, profile)).toBe(0);
	});
});

describe("scoreWorkExpectations — short_distance", () => {
	const profile = makeProfile({ workExpectations: ["short_distance"] });

	test("penalizes -2 when frequentAbsence is true", () => {
		const occ = makeOccupation({
			conditions: { frequentAbsence: true },
		});
		expect(scoreWorkExpectations(occ, profile)).toBe(-2);
	});

	test("penalizes -2 when changingWorkplaces is true", () => {
		const occ = makeOccupation({
			conditions: { changingWorkplaces: true },
		});
		expect(scoreWorkExpectations(occ, profile)).toBe(-2);
	});

	test("penalizes -2 only once even when both are true", () => {
		const occ = makeOccupation({
			conditions: { frequentAbsence: true, changingWorkplaces: true },
		});
		expect(scoreWorkExpectations(occ, profile)).toBe(-2);
	});

	test("awards 0 when neither travel signal is present", () => {
		const occ = makeOccupation();
		expect(scoreWorkExpectations(occ, profile)).toBe(0);
	});
});

describe("scoreWorkExpectations — movement removed", () => {
	test("movement work value has no effect", () => {
		const profile = makeProfile({ workExpectations: ["movement"] });
		const occ = makeOccupation({
			conditions: { standingWalking: true, manualLabor: true, outdoor: true },
		});
		expect(scoreWorkExpectations(occ, profile)).toBe(0);
	});
});
