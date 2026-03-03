export interface SubjectDefinition {
	id: string;
	dataLabel: string;
}

export const SUBJECTS: SubjectDefinition[] = [
	{ id: "math", dataLabel: "Mathematik" },
	{ id: "german", dataLabel: "Deutsch" },
	{ id: "english", dataLabel: "Englisch" },
	{ id: "physics", dataLabel: "Physik" },
	{ id: "chemistry", dataLabel: "Chemie" },
	{ id: "biology", dataLabel: "Biologie" },
	{ id: "computer_science", dataLabel: "Informatik" },
	{ id: "economics", dataLabel: "Wirtschaft" },
	{ id: "crafts_technology", dataLabel: "Werken/Technik" },
	{ id: "art", dataLabel: "Kunst" },
	{ id: "sports", dataLabel: "Sport" },
	{ id: "music", dataLabel: "Musik" },
	{ id: "ethics", dataLabel: "Ethik" },
	{ id: "religion", dataLabel: "Religion" },
];

export const SUBJECT_BY_DATA_LABEL = new Map(
	SUBJECTS.map((s) => [s.dataLabel, s]),
);
