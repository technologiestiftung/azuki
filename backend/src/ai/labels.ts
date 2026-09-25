import { INTERESTS } from "@azuki/shared";

export const EDUCATION_LABELS: Record<string, string> = {
	secondary: "Hauptschulabschluss",
	extended_secondary: "Erweiterter Hauptschulabschluss",
	intermediate: "Realschulabschluss",
	university_entrance: "Abitur",
	unknown: "unbekannt",
	vocational_diploma: "Fachabitur",
	foreign_degree: "Abschluss aus dem Ausland",
	none: "Ohne Abschluss",
};

export const SUBJECT_LABELS: Record<string, string> = {
	math: "Mathe",
	german: "Deutsch",
	english: "Englisch",
	french: "Französisch",
	spanish: "Spanisch",
	physics: "Physik",
	chemistry: "Chemie",
	biology: "Biologie",
	computer_science: "Informatik",
	economics: "Wirtschaft",
	crafts_technology: "Werken/Technik",
	art: "Kunst",
	sports: "Sport",
	music: "Musik",
	ethics: "Ethik",
	religion: "Religion",
	wat: "Wirtschaft-Arbeit-Technik (WAT)",
	home_economics: "Hauswirtschaftslehre",
	pedagogy: "Pädagogik",
	history: "Geschichte",
	politics: "Politik",
	geography: "Geographie",
	ethics_religion: "Ethik und Religion",
	performing_arts: "Darstellendes Spiel",
	other_languages: "Andere Fremdsprachen",
};

export const STRENGTH_LABELS: Record<string, string> = {
	teamwork: "Teamarbeit",
	"logical-thinking": "Logisches Denken",
	creativity: "Kreativität",
	craftsmanship: "Handwerkliches Geschick",
	communication: "Kommunikation",
	concentration: "Konzentration",
	precision: "Genaues Arbeiten",
	perseverance: "Durchhalten",
};

export const WORK_PREF_LABELS: Record<string, { a: string; b: string }> = {
	environment: { a: "Drinnen", b: "Draußen" },
	location: { a: "Fester Arbeitsort", b: "Viel unterwegs" },
	"hands-vs-mind": { a: "Praktisch arbeiten", b: "Nachdenken und planen" },
	variety: { a: "Feste Abläufe", b: "Jeden Tag was Neues" },
	people: { a: "Meist alleine arbeiten", b: "Viel Kontakt mit Menschen" },
	pace: { a: "Immer viel zu tun", b: "Entspanntes Tempo" },
	structure: { a: "Aufgaben erledigen", b: "Neue Ideen entwickeln" },
};

export const NO_GO_LABELS: Record<string, string> = {
	noise: "Arbeit mit Lärm",
	dirt: "Schmutz bei der Arbeit",
	"heavy-work": "Schwere körperliche Arbeit",
	computer: "Den ganzen Tag am Computer",
	"shift-work": "Schicht- oder Nachtarbeit",
	animals: "Arbeit mit Tieren",
	danger: "Gefährliche Arbeit",
};

export const WORK_EXPECTATION_LABELS: Record<string, string> = {
	good_salary: "Gutes Gehalt",
	people_work: "Mit Menschen arbeiten",
	teamwork_value: "Teamarbeit",
	autonomy_responsibility: "Selbstständigkeit und Verantwortung",
	flexible_hours: "Flexible Arbeitszeiten",
	stability: "Sicherheit und Stabilität",
	modern_technology: "Arbeiten mit modernen Technologien",
	short_distance: "Kurzer Arbeitsweg",
	career: "Karriere",
	remote: "Von zu Hause arbeiten",
	friendly_environment: "Freundlicher Umgang",
};

export const INTEREST_LABELS: Record<string, string> = Object.fromEntries(
	INTERESTS.map((interest) => [interest.id, interest.dataLabel]),
);
