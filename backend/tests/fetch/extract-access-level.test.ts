import { describe, expect, test } from "vitest";
import { extractAccessLevelFromText } from "../../../scripts/fetch-berufe.js";

const REALSCHULE_OR_HS_BERUFSAUSBILDUNG =
	"Vorausgesetzt wird in der Regel ein Realschulabschluss, mittlerer Bildungsabschluss oder ein Hauptschulabschluss in Verbindung mit einer mindestens zweijährigen Berufsausbildung.";

const ERZIEHER =
	"In der Regel ist ein mittlerer Bildungsabschluss erforderlich. Zudem ist i.d.R. entweder eine abgeschlossene Ausbildung in einem (sozial-)pädagogischen Beruf oder eine mehrjährige einschlägige Berufstätigkeit nachzuweisen.";

const HEILERZIEHUNGSPFLEGER =
	"In der Regel sind ein mittlerer Bildungsabschluss und entweder eine abgeschlossene Berufsausbildung oder eine mehrjährige einschlägige Berufstätigkeit erforderlich.";

describe("extractAccessLevelFromText", () => {
	test("Realschule OR Hauptschule+Berufsausbildung stays realschule", () => {
		expect(extractAccessLevelFromText(REALSCHULE_OR_HS_BERUFSAUSBILDUNG)).toBe(
			"realschule",
		);
	});

	test("Erzieher — Realschule plus mandatory Vorbildung upgrades to FHR", () => {
		expect(extractAccessLevelFromText(ERZIEHER)).toBe("fachhochschulreife");
	});

	test("Heilerziehungspfleger — Realschule und Vorbildung upgrades to FHR", () => {
		expect(extractAccessLevelFromText(HEILERZIEHUNGSPFLEGER)).toBe(
			"fachhochschulreife",
		);
	});

	test("keine bestimmte Vorbildung → unrestricted", () => {
		expect(
			extractAccessLevelFromText(
				"Rechtlich ist keine bestimmte Vorbildung vorgeschrieben.",
			),
		).toBe("unrestricted");
	});

	test("native Hochschulreife in text → fachhochschulreife", () => {
		expect(
			extractAccessLevelFromText(
				"Vorausgesetzt wird die Hochschulreife sowie ein Ausbildungsvertrag.",
			),
		).toBe("fachhochschulreife");
	});
});
