// Persona: Karim A., 21, kein deutscher Schulabschluss, kam 2015 als Geflüchteter aus dem Libanon.
// Source: tools/personas.md (Persona 3).
//
// Free-text fields are written in-character: A2-level German. Simple words,
// occasional grammatical errors (wrong article, missing conjugation, odd word order).
// Highly motivated tone. Karim writes with effort and determination.
//
// Key signals from the persona description:
// - Kein regulärer Abschluss in Deutschland → educationLevel: "foreign_degree"
//   (hat Schulbildung aus dem Ausland, kein dt. Abschluss)
// - Nicht mehr in Schule, auf Jobsuche → inSchool: false
// - Mathe (mag Zahlen), Sport (Fußball) → favoriteSubjects
// - Logistik oder Einzelhandel als Zielbereich → workPreferences
// - Sprach- und Integrationskurse absolviert → practicalExperience
// - Sehr gewillt, körperliche Arbeit und Bewegung okay

import type { UserProfile } from "../types";

export const karim: UserProfile = {
	inSchool: false,
	educationLevel: "foreign_degree",
	favoriteSubjects: ["math", "sports"],
	customSubjects: [],
	interests: ["team", "gym", "outdoors", "building"],
	customInterests: [],
	workValues: ["good_salary", "stability", "short_distance"],
	strengths: {
		teamwork: 1,
		perseverance: 1,
		craftsmanship: 0.5,
		concentration: 0.5,
	},
	secretTalent:
		"ich kann gut Sachen tragen und organisieren. in Lager oder Markt ich weiß wo alles ist. meine Freunde sagen ich bin sehr zuverlässig",
	practicalExperience:
		"ich haben Integrationskurs gemacht und Sprachkurs. ich habe geholfen bei Umzug von Freunde, viel Kisten tragen und Möbel aufbauen. ich suche Ausbildung in Logistik oder Einzelhandel, ich will arbeiten",
	workPreferences: {
		environment: "a",
		"hands-vs-mind": "a",
		location: "a",
		people: "b",
		pace: "b",
	},
	noGos: {
		computer: "rejected",
	},
};
