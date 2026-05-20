// --- Work Conditions ---

export interface WorkConditions {
	outdoor: boolean;
	office: boolean;
	workshop: boolean;
	/**
	 * True if BERUFENET lists any indoor workplace — Büroräume, Werkstätten,
	 * Verkaufsräume, Lagerhallen/-räume, Kühlhäuser, Küchen, Praxisräume,
	 * Klassenzimmer, Krankenhäuser, etc. Broader than office || workshop;
	 * used by environment:a (Drinnen) so the indoor preference matches every
	 * indoor Beruf, not only office/workshop variants.
	 */
	indoor: boolean;
	constructionSite: boolean;
	screenWork: boolean;
	manualLabor: boolean;
	machinery: boolean;
	noise: boolean;
	dirt: boolean;
	heavyLifting: boolean;
	heights: boolean;
	shiftWork: boolean;
	customerContact: boolean;
	teamwork: boolean;
	standingWalking: boolean;
	irregularHours: boolean;
	changingTasks: boolean;
	regulatedWork: boolean;
	animalWork: boolean;
	accidentRisk: boolean;
	precisionWork: boolean;
	frequentAbsence: boolean;
	changingWorkplaces: boolean;
}

// --- Degree Statistics ---

export interface DegreeDistribution {
	noQualification: number;
	secondary: number;
	intermediate: number;
	universityEntrance: number;
}

// --- Access Level (legal/practical school-degree access requirement) ---
//
// Parsed from BERUFENET field a30-0. Used as a fallback for scoreEducation
// when degreeStats (field a31-12, percentage breakdowns) is null — which is
// the case for ~49% of Berufe including all §66 Fachpraktiker, schulische
// Ausbildungen (Erzieher, Sozialassistent, Altenpflegehelfer), and most
// Assistent/in variants.
//
// Ordered from least to most restrictive. `unrestricted` covers Berufe
// that explicitly say "keine bestimmte Vorbildung vorgeschrieben" (e.g.
// §66 records, MFA, ZFA in practice).
export type AccessLevel =
	| "unrestricted"
	| "hauptschule"
	| "realschule"
	| "fachhochschulreife";

// --- Occupation Image ---

export interface OccupationImage {
	url: string;
	caption: string;
	imageGroup: string;
}

// --- Occupation (single entry in berufe.json) ---

export interface Occupation {
	id: number;
	name: string;
	descriptionShort: string | null;
	descriptionLong: string | null;
	taskSummary: string | null;
	images: OccupationImage[];
	degreeStats: DegreeDistribution | null;
	// Parsed from BERUFENET a30-0 (legal Zugangsvoraussetzungen). Used as
	// fallback for scoreEducation when degreeStats is null.
	accessLevel: AccessLevel | null;
	subjects: string[];
	interests: string[];
	interestKeywords: string[];
	strengthTags: string[];
	skillTags: string[];
	conditions: WorkConditions;
	salaryMonthlyMedian: number | null;
	salaryKnown: boolean;
	digitalizationSignal: boolean;
	workLocations: string;
	competenciesText: string;
	// Set on §66 BBiG / §42r HwO Fachpraktiker records by hydrate-fachpraktiker.
	// Points to the regular Ausbildung whose tags were inherited. Used by
	// scorePopularity to make §66 popularity track its parent's tier.
	parentId?: number | null;
	/** Klassifikation der Berufe 2010 (KldB 2010) — joint Bundesagentur/Destatis classification, used to join external datasets. */
	germanOccupationCode: string | null;
}

// --- Education Level (user's own degree) ---

export type EducationLevel =
	| "secondary"
	| "extended_secondary"
	| "intermediate"
	| "none"
	| "university_entrance"
	| "vocational_diploma"
	| "foreign_degree"
	| "unknown";

// --- User Choices ---

export type NoGoAnswer = "rejected" | "accepted";

export type WorkPreferenceChoice = "a" | "b";

// --- User Profile (POST /api/match body) ---

export interface UserProfile {
	inSchool: boolean | null;
	educationLevel: EducationLevel | null;
	favoriteSubjects: string[];
	customSubjects: string[];
	interests: string[];
	customInterests: string[];
	workValues: string[];
	strengths: Record<string, number>;
	secretTalent: string;
	practicalExperience: string;
	workPreferences: Record<string, WorkPreferenceChoice | null>;
	noGos: Record<string, NoGoAnswer | null>;
}

// --- Match Result (POST /api/match response) ---

export interface MatchedOccupation {
	id: number;
	name: string;
	score: number;
	images: OccupationImage[];
	taskSummary: string;
	reasoning: string;
	occupationType: string;
	occupationDuration: string;
	occupationEarnings: string;
}

export interface MatchResult {
	occupations: MatchedOccupation[];
	generation?: GenerationInfo;
}

export interface GenerationInfo {
	model: string;
	cost: number;
	tokensInput: number;
	tokensOutput: number;
}
