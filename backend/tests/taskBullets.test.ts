import { describe, expect, test } from "vitest";
import { resolveOccupationTaskBullets } from "@azuki/shared";
import { makeOccupation } from "./scoring/helpers.js";

describe("resolveOccupationTaskBullets", () => {
	test("returns pre-generated taskBullets capped at 4", () => {
		const occ = makeOccupation({
			taskBullets: [
				"Briefe schreiben und E-Mails beantworten",
				"Termine planen und Kalender pflegen",
				"Rechnungen vorbereiten und ablegen",
				"Besucher empfangen und weiterleiten",
				"Extra bullet that should be dropped",
			],
		});
		expect(resolveOccupationTaskBullets(occ)).toEqual([
			"Briefe schreiben und E-Mails beantworten",
			"Termine planen und Kalender pflegen",
			"Rechnungen vorbereiten und ablegen",
			"Besucher empfangen und weiterleiten",
		]);
	});

	test("trims whitespace and drops empty bullets", () => {
		const occ = makeOccupation({
			taskBullets: ["  Autos reparieren  ", "", "   "],
		});
		expect(resolveOccupationTaskBullets(occ)).toEqual(["Autos reparieren"]);
	});

	test("returns empty array when taskBullets are missing", () => {
		const occ = makeOccupation({});
		expect(resolveOccupationTaskBullets(occ)).toEqual([]);
	});
});
