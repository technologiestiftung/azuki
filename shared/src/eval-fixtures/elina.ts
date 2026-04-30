// Persona: Elina M., 17, Realschule (letztes Schuljahr), bulgarischer Migrationshintergrund (2. Gen.).
// Source: tools/personas.md (Persona 2).
//
// Free-text fields are written in-character: considered, full sentences,
// slightly reflexive, careful word choice. Elina is worried about making
// the "wrong" choice. She reads, draws, and translates for her family.
//
// Key signals from the persona description:
// - Realschule, letztes Schuljahr → educationLevel: "intermediate", inSchool: true
// - Unsicher ob Ausbildung oder Fachabitur → keine feste Entscheidung
// - Deutsch (schreibt gern), Kunst (kreatives Arbeiten) → favoriteSubjects
// - Lesen, Zeichnen, DIY-Projekte, TikTok Aesthetics → interests: drawing, reading, crafting
// - Übersetzt für Familie → helping as interest
// - Sorgt sich um "falsche" Entscheidung → keine starken noGos, vorsichtig bei workValues

import type { UserProfile } from "../types";

export const elina: UserProfile = {
	inSchool: true,
	educationLevel: "intermediate",
	favoriteSubjects: ["german", "art"],
	customSubjects: [],
	interests: ["drawing", "reading", "crafting", "helping"],
	customInterests: [],
	workValues: ["people_work", "autonomy_responsibility", "stability"],
	strengths: {
		creativity: 1,
		communication: 1,
		concentration: 0.5,
		precision: 0.5,
	},
	secretTalent:
		"Ich übersetze seit Jahren Behördenbriefe und Arztgespräche für meine Eltern. Ich bin gut darin, schwierige Texte in einfache Sprache zu bringen.",
	practicalExperience:
		"Ich habe bisher keine richtige Berufserfahrung. Manchmal helfe ich bei schulischen Projekten aus, und zuhause übernehme ich viel Verantwortung für meine jüngeren Geschwister. Ich weiß noch nicht genau, welchen Weg ich nehmen soll.",
	workPreferences: {
		environment: "a",
		"hands-vs-mind": "b",
		people: "b",
		variety: "b",
		structure: "b",
	},
	noGos: {
		noise: "rejected",
		dirt: "rejected",
	},
};
