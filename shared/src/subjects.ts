export interface SubjectDefinition {
	id: string;
	dataLabel: string;
}

export const SUBJECTS: SubjectDefinition[] = [
	{ id: "math", dataLabel: "Mathematik" },
	{ id: "german", dataLabel: "Deutsch" },
	{ id: "english", dataLabel: "Englisch" },
	{ id: "french", dataLabel: "Französisch" },
	{ id: "spanish", dataLabel: "Spanisch" },
	{ id: "physics", dataLabel: "Physik" },
	{ id: "chemistry", dataLabel: "Chemie" },
	{ id: "biology", dataLabel: "Biologie" },
	{ id: "computer_science", dataLabel: "Informatik" },
	{ id: "economics", dataLabel: "Wirtschaft" },
	{ id: "wat", dataLabel: "Wirtschaft-Arbeit-Technik" },
	{ id: "home_economics", dataLabel: "Hauswirtschaftslehre" },
	{ id: "pedagogy", dataLabel: "Pädagogik" },
	{ id: "history", dataLabel: "Geschichte" },
	{ id: "politics", dataLabel: "Politik" },
	{ id: "geography", dataLabel: "Geographie" },
	{ id: "crafts_technology", dataLabel: "Werken/Technik" },
	{ id: "art", dataLabel: "Kunst" },
	{ id: "sports", dataLabel: "Sport" },
	{ id: "music", dataLabel: "Musik" },
	{ id: "ethics", dataLabel: "Ethik" },
	{ id: "religion", dataLabel: "Religion" },
	{ id: "ethics_religion", dataLabel: "Ethik und Religion" },
	{ id: "performing_arts", dataLabel: "Darstellendes Spiel" },
	{ id: "other_languages", dataLabel: "Andere Fremdsprachen" },
];
