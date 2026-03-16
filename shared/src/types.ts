// --- Work Conditions ---

export interface WorkConditions {
	outdoor: boolean;
	office: boolean;
	workshop: boolean;
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
}

// --- Degree Statistics ---

export interface DegreeDistribution {
	noQualification: number;
	secondary: number;
	intermediate: number;
	universityEntrance: number;
}

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
	subjects: string[];
	interests: string[];
	interestKeywords: string[];
	strengthTags: string[];
	conditions: WorkConditions;
	salaryMonthlyMedian: number | null;
	salaryKnown: boolean;
	digitalizationSignal: boolean;
	workLocations: string;
	competenciesText: string;
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
}

export interface MatchResult {
	occupations: MatchedOccupation[];
}
