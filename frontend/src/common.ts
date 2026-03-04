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
