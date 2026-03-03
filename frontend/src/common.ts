export type SchoolDegree =
	| "hauptschule"
	| "erweitert_hauptschule"
	| "realschule"
	| "ohne_abschluss"
	| "abitur"
	| "unknown";

export type NoGoAnswer = "geht_nicht" | "ist_okay";

export type WorkPreferenceChoice = "a" | "b";

export interface StrengthRating {
	id: string;
	value: number;
}

export interface WorkPreference {
	id: string;
	choice: WorkPreferenceChoice | null;
}

export interface UserProfile {
	schulabschluss: SchoolDegree | null;
	lieblingsfaecher: string[];
	interessen: string[];
	customInteressen: string[];
	staerken: Record<string, number>;
	geheimesTalent: string;
	praktischeErfahrungen: string;
	arbeitsbedingungen: Record<string, WorkPreferenceChoice | null>;
	noGos: Record<string, NoGoAnswer | null>;
}

export interface Bedingungen {
	draussen: boolean;
	buero: boolean;
	werkstatt: boolean;
	baustelle: boolean;
	bildschirm: boolean;
	handarbeit: boolean;
	maschinen: boolean;
	laerm: boolean;
	schmutz: boolean;
	schweresHeben: boolean;
	hoehe: boolean;
	schichtarbeit: boolean;
	kundenkontakt: boolean;
	teamarbeit: boolean;
	stehenGehen: boolean;
}

export interface Schulabschluss {
	ohne: number;
	hauptschule: number;
	mittel: number;
	hochschulreife: number;
}

export interface BerufBild {
	url: string;
	unterschrift: string;
	bildgruppe: string;
}

export interface Beruf {
	id: number;
	name: string;
	steckbriefKurz: string | null;
	steckbriefLang: string | null;
	aufgabenKompakt: string | null;
	bilder: BerufBild[];
	schulabschluss: Schulabschluss | null;
	schulfaecher: string[];
	interessen: string[];
	bedingungen: Bedingungen;
	arbeitsorte: string;
	kompetenzenText: string;
}

export interface MatchedBeruf {
	id: number;
	name: string;
	score: number;
	bilder: BerufBild[];
	aufgabenKompakt: string;
	begruendung: string;
}

export interface MatchResult {
	berufe: MatchedBeruf[];
}

export enum Step {
	Login = 0,
	Welcome = 1,
	Start = 2,
	InSchool = 3,
	SchoolDegreeStep = 4,
	SchoolSubjects = 5,
	Interests = 6,
	Strengths = 7,
	SecretTalent = 8,
	PracticalExperience = 9,
	WorkPreferences = 10,
	NoGos = 11,
	Loading = 12,
	Results = 13,
}

export const QUESTIONNAIRE_STEPS = [
	Step.InSchool,
	Step.SchoolDegreeStep,
	Step.SchoolSubjects,
	Step.Interests,
	Step.Strengths,
	Step.SecretTalent,
	Step.PracticalExperience,
	Step.WorkPreferences,
	Step.NoGos,
];

export const TOTAL_QUESTIONNAIRE_STEPS = QUESTIONNAIRE_STEPS.length;
