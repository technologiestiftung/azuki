import { describe, expect, test } from "vitest";
import { scoreStrengths } from "../../src/matching/score/dimensions.js";
import { makeOccupation, makeProfile } from "./helpers.js";

describe("scoreStrengths — empathy", () => {
	const profile = makeProfile({ strengths: { empathy: 0.8 } });

	test("awards +2 when occupation has 'Einfühlungsvermögen' strengthTag", () => {
		const occ = makeOccupation({ strengthTags: ["Einfühlungsvermögen"] });
		expect(scoreStrengths(occ, profile)).toBe(2);
	});

	test("does NOT award when occupation lacks empathy tags", () => {
		const occ = makeOccupation({ strengthTags: ["Sorgfalt"] });
		expect(scoreStrengths(occ, profile)).toBe(0);
	});

	test("does NOT fire when empathy is below 0.5", () => {
		const lowProfile = makeProfile({ strengths: { empathy: 0.4 } });
		const occ = makeOccupation({ strengthTags: ["Einfühlungsvermögen"] });
		expect(scoreStrengths(occ, lowProfile)).toBe(0);
	});
});

describe("scoreStrengths — logical-thinking", () => {
	const profile = makeProfile({
		strengths: { "logical-thinking": 0.8 },
	});

	test("awards +2 when occupation has Umsicht tag", () => {
		const occ = makeOccupation({ strengthTags: ["Umsicht"] });
		expect(scoreStrengths(occ, profile)).toBe(2);
	});

	test("does NOT award points for Sorgfalt alone", () => {
		const occ = makeOccupation({ strengthTags: ["Sorgfalt"] });
		expect(scoreStrengths(occ, profile)).toBe(0);
	});

	test("awards +2 when both Umsicht and Sorgfalt present", () => {
		const occ = makeOccupation({
			strengthTags: ["Umsicht", "Sorgfalt"],
		});
		expect(scoreStrengths(occ, profile)).toBe(2);
	});
});

describe("scoreStrengths — precision", () => {
	const profile = makeProfile({
		strengths: { precision: 0.7 },
	});

	test("awards +2 when occupation has precisionWork condition", () => {
		const occ = makeOccupation({
			conditions: { precisionWork: true },
		});
		expect(scoreStrengths(occ, profile)).toBe(2);
	});

	test("does NOT award points for Sorgfalt", () => {
		const occ = makeOccupation({
			strengthTags: ["Sorgfalt"],
		});
		expect(scoreStrengths(occ, profile)).toBe(0);
	});

	test("does NOT award points when precisionWork is false", () => {
		const occ = makeOccupation();
		expect(scoreStrengths(occ, profile)).toBe(0);
	});
});

describe("scoreStrengths — concentration", () => {
	const profile = makeProfile({
		strengths: { concentration: 0.6 },
	});

	test("awards +2 when occupation has Konzentration in skillTags", () => {
		const occ = makeOccupation({
			skillTags: ["Konzentration"],
		});
		expect(scoreStrengths(occ, profile)).toBe(2);
	});

	test("awards +2 when occupation has Daueraufmerksamkeit in skillTags", () => {
		const occ = makeOccupation({
			skillTags: ["Daueraufmerksamkeit"],
		});
		expect(scoreStrengths(occ, profile)).toBe(2);
	});

	test("does NOT award points for Sorgfalt in strengthTags", () => {
		const occ = makeOccupation({
			strengthTags: ["Sorgfalt"],
		});
		expect(scoreStrengths(occ, profile)).toBe(0);
	});

	test("does NOT award points when skillTags is empty", () => {
		const occ = makeOccupation();
		expect(scoreStrengths(occ, profile)).toBe(0);
	});
});

describe("scoreStrengths — multiple strengths score independently", () => {
	test("logical-thinking + precision + concentration can each award separately", () => {
		const profile = makeProfile({
			strengths: {
				"logical-thinking": 1.0,
				precision: 0.8,
				concentration: 0.7,
			},
		});
		const occ = makeOccupation({
			strengthTags: ["Umsicht"],
			conditions: { precisionWork: true },
			skillTags: ["Konzentration"],
		});
		expect(scoreStrengths(occ, profile)).toBe(6);
	});

	test("only awards for matching signals, not all three", () => {
		const profile = makeProfile({
			strengths: {
				"logical-thinking": 1.0,
				precision: 0.8,
				concentration: 0.7,
			},
		});
		const occ = makeOccupation({
			strengthTags: ["Umsicht", "Sorgfalt"],
		});
		expect(scoreStrengths(occ, profile)).toBe(2);
	});
});

describe("scoreStrengths — unchanged strengths still work", () => {
	test("craftsmanship still uses conditions fallback", () => {
		const profile = makeProfile({ strengths: { craftsmanship: 0.8 } });
		const occ = makeOccupation({ conditions: { manualLabor: true } });
		expect(scoreStrengths(occ, profile)).toBe(2);
	});

	test("teamwork still uses strengthTags", () => {
		const profile = makeProfile({ strengths: { teamwork: 0.8 } });
		const occ = makeOccupation({
			strengthTags: ["Befähigung zu Gruppenarbeit / Teamfähigkeit"],
		});
		expect(scoreStrengths(occ, profile)).toBe(2);
	});

	test("below-threshold strengths award nothing", () => {
		const profile = makeProfile({ strengths: { precision: 0.3 } });
		const occ = makeOccupation({ conditions: { precisionWork: true } });
		expect(scoreStrengths(occ, profile)).toBe(0);
	});
});

describe("scoreStrengths — creativity b20-2 fallback", () => {
	const profile = makeProfile({ strengths: { creativity: 0.8 } });

	test("awards +2 for Ästhetik skillTag", () => {
		const occ = makeOccupation({
			skillTags: ["Sinn und Gespür für Ästhetik"],
		});
		expect(scoreStrengths(occ, profile)).toBe(2);
	});

	test("awards +2 for Zeichnerische Befähigung skillTag", () => {
		const occ = makeOccupation({
			skillTags: ["Zeichnerische Befähigung"],
		});
		expect(scoreStrengths(occ, profile)).toBe(2);
	});

	test("still awards +2 for b20-4 Kreativität tag", () => {
		const occ = makeOccupation({ strengthTags: ["Kreativität"] });
		expect(scoreStrengths(occ, profile)).toBe(2);
	});

	test("awards only +2 even when both b20-4 and b20-2 match", () => {
		const occ = makeOccupation({
			strengthTags: ["Kreativität"],
			skillTags: ["Sinn und Gespür für Ästhetik"],
		});
		expect(scoreStrengths(occ, profile)).toBe(2);
	});
});

describe("scoreStrengths — precision b20-2 fallback", () => {
	const profile = makeProfile({ strengths: { precision: 0.7 } });

	test("awards +2 for Beobachtungsgenauigkeit skillTag", () => {
		const occ = makeOccupation({
			skillTags: ["Beobachtungsgenauigkeit"],
		});
		expect(scoreStrengths(occ, profile)).toBe(2);
	});

	test("still awards +2 for precisionWork condition", () => {
		const occ = makeOccupation({ conditions: { precisionWork: true } });
		expect(scoreStrengths(occ, profile)).toBe(2);
	});
});

describe("scoreStrengths — craftsmanship b20-2 fallback", () => {
	const profile = makeProfile({ strengths: { craftsmanship: 0.8 } });

	test("awards +2 for Fingergeschick skillTag", () => {
		const occ = makeOccupation({
			skillTags: ["Fingergeschick"],
		});
		expect(scoreStrengths(occ, profile)).toBe(2);
	});

	test("still awards +2 for manualLabor condition", () => {
		const occ = makeOccupation({ conditions: { manualLabor: true } });
		expect(scoreStrengths(occ, profile)).toBe(2);
	});
});

describe("scoreStrengths — logical-thinking b20-2 fallback", () => {
	const profile = makeProfile({ strengths: { "logical-thinking": 0.8 } });

	test("awards +2 for Numerisches Denken skillTag", () => {
		const occ = makeOccupation({
			skillTags: ["Numerisches (rechnerisches) Denken"],
		});
		expect(scoreStrengths(occ, profile)).toBe(2);
	});

	test("still awards +2 for Umsicht strengthTag", () => {
		const occ = makeOccupation({ strengthTags: ["Umsicht"] });
		expect(scoreStrengths(occ, profile)).toBe(2);
	});
});

describe("scoreStrengths — communication b20-2 fallback", () => {
	const profile = makeProfile({ strengths: { communication: 0.8 } });

	test("awards +2 for Mündliches Ausdrucksvermögen skillTag", () => {
		const occ = makeOccupation({
			skillTags: ["Mündliches Ausdrucksvermögen"],
		});
		expect(scoreStrengths(occ, profile)).toBe(2);
	});

	test("awards +2 for Schriftliches Ausdrucksvermögen skillTag", () => {
		const occ = makeOccupation({
			skillTags: ["Schriftliches Ausdrucksvermögen und Rechtschreibsicherheit"],
		});
		expect(scoreStrengths(occ, profile)).toBe(2);
	});

	test("still awards +2 for Kommunikationsfähigkeit strengthTag", () => {
		const occ = makeOccupation({
			strengthTags: ["Kommunikationsfähigkeit"],
		});
		expect(scoreStrengths(occ, profile)).toBe(2);
	});
});
