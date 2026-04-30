// Persona: Nico B., 18, Hauptschulabschluss, Kfz-Ausbildung nach 4 Monaten abgebrochen.
// Source: tools/personas.md (Persona 1).
//
// Free-text fields are written in-character: short, slang, lowercase,
// no Fachbegriffe. Nico writes the way he speaks — fragmentarisch, direkt.
//
// Key signals from the persona description:
// - Hauptschulabschluss "mit Ach und Krach" → educationLevel: "secondary"
// - Out of school after dropped Ausbildung → inSchool: false
// - Kfz-Ausbildung abgebrochen wegen körperlicher Belastung & rauem Klima
//   → noGo on heavy-work; practicalExperience captures it
// - Sport favorite (Bewegung, weniger Bewertung) → favoriteSubjects: ["sports"]
// - Auto-Videos, YouTube, Block-Kultur → interests: videos, screwing
// - Frustriert über fehlende Bezahlung → workValues: good_salary, stability

import type { UserProfile } from "../types";

export const nico: UserProfile = {
	inSchool: false,
	educationLevel: "secondary",
	favoriteSubjects: ["sports"],
	customSubjects: [],
	interests: ["videos", "screwing", "gym"],
	customInterests: [],
	workValues: ["good_salary", "stability"],
	strengths: {
		craftsmanship: 1,
		perseverance: 0.5,
		teamwork: 0.5,
	},
	secretTalent:
		"kann gut mit autos und werkzeug umgehen, nicht krass aber ich finds einfach, wo andere nicht weiterkommen",
	practicalExperience:
		"hab 4 monate kfz-mechatroniker gemacht, war zu hart körperlich und der ton in der werkstatt war nichts für mich. hab aufgehört. will was wo man nicht den ganzen tag nur ackert",
	workPreferences: {
		environment: "a",
		"hands-vs-mind": "a",
		people: "a",
		pace: "a",
	},
	noGos: {
		"heavy-work": "rejected",
		noise: "rejected",
	},
};
