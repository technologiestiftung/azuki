export type {
	WorkConditions,
	DegreeDistribution,
	OccupationImage,
	Occupation,
	EducationLevel,
	NoGoAnswer,
	WorkPreferenceChoice,
	UserProfile,
	MatchedOccupation,
	MatchResult,
	SubjectDefinition,
	AusbildungsplaetzeResponse,
} from "@azuki/shared";

import type { WorkPreferenceChoice } from "@azuki/shared";

export interface StrengthRating {
	id: string;
	value: number;
}

export interface WorkPreference {
	id: string;
	choice: WorkPreferenceChoice | null;
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
	WorkValues = 8,
	SecretTalent = 9,
	PracticalExperience = 10,
	WorkPreferences = 11,
	NoGos = 12,
	Loading = 13,
	Results = 14,
	FreiePlaetze = 15,
}

export const QUESTIONNAIRE_STEPS = [
	Step.InSchool,
	Step.SchoolDegreeStep,
	Step.SchoolSubjects,
	Step.Interests,
	Step.Strengths,
	Step.WorkValues,
	Step.SecretTalent,
	Step.PracticalExperience,
	Step.WorkPreferences,
	Step.NoGos,
];

export const TOTAL_QUESTIONNAIRE_STEPS = QUESTIONNAIRE_STEPS.length;
