import { describe, expect, it } from "vitest";
import { resolveOccupationTag } from "@azuki/shared";

describe("resolveOccupationTag", () => {
	it("maps common Berufshauptgruppen to sector tags", () => {
		expect(resolveOccupationTag("25102")).toBe("maschinen-fahrzeuge");
		expect(resolveOccupationTag("43102")).toBe("computer-it");
		expect(resolveOccupationTag("32102")).toBe("bauen-handwerk");
		expect(resolveOccupationTag("29302")).toBe("essen-gastronomie");
	});

	it("splits food production from tourism, events and sport in KldB 63", () => {
		expect(resolveOccupationTag("63302")).toBe("essen-gastronomie");
		expect(resolveOccupationTag("63402")).toBe(
			"tourismus-veranstaltungen-sport",
		);
		expect(resolveOccupationTag("63102")).toBe(
			"tourismus-veranstaltungen-sport",
		);
		expect(resolveOccupationTag("63202")).toBe(
			"tourismus-veranstaltungen-sport",
		);
	});

	it("splits wellness and beauty from the wider health group", () => {
		expect(resolveOccupationTag("82322")).toBe("beauty-fitness");
		expect(resolveOccupationTag("82222")).toBe("beauty-fitness");
		expect(resolveOccupationTag("82512")).toBe("gesundheit");
	});

	it("falls back to Sonstige for missing or unknown codes", () => {
		expect(resolveOccupationTag(null)).toBe("sonstige");
		expect(resolveOccupationTag("")).toBe("sonstige");
		expect(resolveOccupationTag("99999")).toBe("sonstige");
	});
});
