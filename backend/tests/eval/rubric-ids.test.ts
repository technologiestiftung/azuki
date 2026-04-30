import { describe, expect, test } from "vitest";
import { RUBRICS, PERSONA_IDS } from "@azuki/shared";
import occupationsData from "../../src/data/berufe.json";

const validIds = new Set(
	(occupationsData as Array<{ id: number }>).map((o) => o.id),
);

describe("rubric IDs reference real occupations", () => {
	for (const personaId of PERSONA_IDS) {
		const rubric = RUBRICS[personaId];

		test(`${personaId}: every tierS ID exists in berufe.json`, () => {
			const missing = rubric.tierS.filter((id) => !validIds.has(id));
			expect(missing).toEqual([]);
		});

		test(`${personaId}: every tierA ID exists in berufe.json`, () => {
			const missing = rubric.tierA.filter((id) => !validIds.has(id));
			expect(missing).toEqual([]);
		});

		test(`${personaId}: every tierC ID exists in berufe.json`, () => {
			const missing = rubric.tierC.filter((id) => !validIds.has(id));
			expect(missing).toEqual([]);
		});
	}
});
