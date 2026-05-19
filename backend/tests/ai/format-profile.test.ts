import { describe, expect, test } from "vitest";
import { formatProfileSections } from "../../src/ai/index.js";
import { makeProfile } from "../scoring/helpers.js";

describe("formatProfileSections — custom interest dedup", () => {
	test("does NOT list custom interests twice when they are mirrored into interests", () => {
		// Reproduces real-world store state: addCustomInterest pushes the entry into
		// both `customInterests` and `interests`. The prompt should only emit it once,
		// under the "eigene Angaben" line.
		const profile = makeProfile({
			interests: ["testhobby"],
			customInterests: ["testhobby"],
		});

		const output = formatProfileSections(profile);

		// The custom entry must appear in the "Weitere Interessen" line.
		expect(output).toContain("Weitere Interessen (eigene Angaben): testhobby");

		// It must NOT also appear in the "Interessen/Hobbys" line. Since "testhobby"
		// is the only interest in this profile, that line should be omitted entirely.
		expect(output).not.toMatch(/^Interessen\/Hobbys:/m);
	});

	test("emits predefined interests under Interessen/Hobbys with their German label", () => {
		// "gaming" is a predefined interest ID — INTEREST_LABELS maps it to its
		// German dataLabel via INTERESTS in @azuki/shared.
		const profile = makeProfile({ interests: ["gaming"] });

		const output = formatProfileSections(profile);

		expect(output).toMatch(/^Interessen\/Hobbys: .+/m);
		// The entry must NOT be the raw ID — the label() lookup must have resolved it.
		expect(output).not.toContain("Interessen/Hobbys: gaming");
		expect(output).not.toContain("Weitere Interessen (eigene Angaben):");
	});

	test("lists predefined and custom interests on separate lines, each only once", () => {
		const profile = makeProfile({
			interests: ["gaming", "myhobby"], // store mirrors custom entries into interests
			customInterests: ["myhobby"],
		});

		const output = formatProfileSections(profile);

		// Predefined line is present and contains the labeled "gaming" but NOT "myhobby".
		const interestLine = output
			.split("\n")
			.find((line) => line.startsWith("Interessen/Hobbys:"));
		expect(interestLine).toBeDefined();
		expect(interestLine).not.toContain("myhobby");

		// Custom line is present and contains "myhobby".
		expect(output).toContain("Weitere Interessen (eigene Angaben): myhobby");

		// "myhobby" must appear exactly once across the whole output.
		const occurrences = output.split("myhobby").length - 1;
		expect(occurrences).toBe(1);
	});

	test("omits both interest lines when neither array has entries", () => {
		const profile = makeProfile(); // both arrays default to []

		const output = formatProfileSections(profile);

		expect(output).not.toMatch(/^Interessen\/Hobbys:/m);
		expect(output).not.toMatch(/^Weitere Interessen \(eigene Angaben\):/m);
	});
});

describe("formatProfileSections — custom subject dedup", () => {
	test("does NOT list custom subjects under Lieblingsfächer when they are mirrored into favoriteSubjects", () => {
		// addCustomSubject in useAppStore.ts mirrors entries into both arrays —
		// same pattern as custom interests. The custom entry should only appear
		// under the "eigene Angaben" line.
		const profile = makeProfile({
			favoriteSubjects: ["extra schulfach"],
			customSubjects: ["extra schulfach"],
		});

		const output = formatProfileSections(profile);

		expect(output).toContain(
			"Weitere Schulfächer (eigene Angaben): extra schulfach",
		);
		// No predefined entry remains, so the Lieblingsfächer line should be omitted.
		expect(output).not.toMatch(/^Lieblingsfächer:/m);
	});

	test("emits predefined subjects under Lieblingsfächer with their German label", () => {
		const profile = makeProfile({ favoriteSubjects: ["math"] });

		const output = formatProfileSections(profile);

		expect(output).toContain("Lieblingsfächer: Mathe");
		expect(output).not.toMatch(/^Weitere Schulfächer \(eigene Angaben\):/m);
	});

	test("lists predefined and custom subjects on separate lines, each only once", () => {
		const profile = makeProfile({
			favoriteSubjects: ["math", "extra schulfach"], // store mirrors custom entries
			customSubjects: ["extra schulfach"],
		});

		const output = formatProfileSections(profile);

		const subjectLine = output
			.split("\n")
			.find((line) => line.startsWith("Lieblingsfächer:"));
		expect(subjectLine).toBeDefined();
		expect(subjectLine).toContain("Mathe");
		expect(subjectLine).not.toContain("extra schulfach");

		expect(output).toContain(
			"Weitere Schulfächer (eigene Angaben): extra schulfach",
		);

		const occurrences = output.split("extra schulfach").length - 1;
		expect(occurrences).toBe(1);
	});

	test("omits both subject lines when neither array has entries", () => {
		const profile = makeProfile();

		const output = formatProfileSections(profile);

		expect(output).not.toMatch(/^Lieblingsfächer:/m);
		expect(output).not.toMatch(/^Weitere Schulfächer \(eigene Angaben\):/m);
	});
});

describe("formatProfileSections — free-text fields labeled as eigene Angaben", () => {
	test("Geheimes Talent label includes (eigene Angaben) suffix", () => {
		const profile = makeProfile({ secretTalent: "kann gut zuhören" });

		const output = formatProfileSections(profile);

		expect(output).toContain(
			"Geheimes Talent (eigene Angaben): kann gut zuhören",
		);
		// Bare label without suffix must not appear.
		expect(output).not.toMatch(/^Geheimes Talent: /m);
	});

	test("Praktische Erfahrungen label includes (eigene Angaben) suffix", () => {
		const profile = makeProfile({
			practicalExperience: "Praktikum in der Tischlerei",
		});

		const output = formatProfileSections(profile);

		expect(output).toContain(
			"Praktische Erfahrungen (eigene Angaben): Praktikum in der Tischlerei",
		);
		expect(output).not.toMatch(/^Praktische Erfahrungen: /m);
	});

	test("free-text field lines are omitted when the values are empty strings", () => {
		const profile = makeProfile(); // secretTalent and practicalExperience default to ""

		const output = formatProfileSections(profile);

		expect(output).not.toContain("Geheimes Talent");
		expect(output).not.toContain("Praktische Erfahrungen");
	});
});
