
export const EDUCATION_LABELS: Record<string, string> = {
	secondary: "Hauptschulabschluss",
	extended_secondary: "Erweiterter Hauptschulabschluss",
	intermediate: "Realschulabschluss",
	none: "Ohne Abschluss",
	university_entrance: "Abitur",
	unknown: "Unbekannt",
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
	location: { a: "Immer am gleichen Ort", b: "Oft unterwegs" },
	"hands-vs-mind": { a: "Mit den Händen arbeiten", b: "Mit dem Kopf arbeiten" },
	variety: { a: "Immer die gleichen Aufgaben", b: "Immer andere Aufgaben" },
	people: { a: "Wenig Kontakt mit Menschen", b: "Viel Kontakt mit Menschen" },
	pace: { a: "Ruhige Arbeit", b: "Arbeit unter Zeitdruck" },
	structure: { a: "Feste Regeln", b: "Viel Freiheit" },
	purpose: { a: "Anderen helfen", b: "Aufgaben erledigen" },
	environment: { a: "Drinnen", b: "Draußen" },
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

export const WORK_VALUE_LABELS: Record<string, string> = {
	good_salary: "Gutes Gehalt",
	people_work: "Mit Menschen arbeiten",
	teamwork_value: "Teamarbeit",
	autonomy_responsibility: "Selbstständigkeit und Verantwortung",
	flexible_hours: "Flexible Arbeitszeiten",
	stability: "Sicherheit und Stabilität",
	modern_technology: "Arbeiten mit modernen Technologien",
	movement: "Viel Bewegung",
	short_distance: "Kurzer Arbeitsweg",
	career: "Karriere",
	benefits: "Benefits (Arbeitgeberleistungen)",
	remote: "Remote möglich",
};