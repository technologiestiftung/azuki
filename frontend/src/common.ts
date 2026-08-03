export type {
	WorkConditions,
	DegreeDistribution,
	OccupationImage,
	Occupation,
	EducationLevel,
	NoGoAnswer,
	WorkPreferenceChoice,
	UserProfile,
	PracticalExperienceEntry,
	MatchedOccupation,
	MatchResult,
	SubjectDefinition,
	VacanciesResponse,
} from "@azuki/shared";

export { formatPracticalExperiencesForApi } from "@azuki/shared";

import type {
	PracticalExperienceEntry,
	WorkPreferenceChoice,
} from "@azuki/shared";

export type PracticalExperienceInput = Omit<PracticalExperienceEntry, "id">;

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
	Start = 1,
	InSchool = 2,
	SchoolDegreeStep = 3,
	SchoolSubjects = 4,
	Interests = 5,
	Strengths = 7,
	WorkExpectations = 9,
	PracticalExperience = 10,
	WorkPreferences = 11,
	NoGos = 12,
	Loading = 13,
	Results = 14,
}

export const QUESTIONNAIRE_STEPS = [
	Step.InSchool,
	Step.SchoolDegreeStep,
	Step.SchoolSubjects,
	Step.Interests,
	Step.Strengths,
	Step.WorkExpectations,
	Step.PracticalExperience,
	Step.WorkPreferences,
	Step.NoGos,
];

export const TOTAL_QUESTIONNAIRE_STEPS = QUESTIONNAIRE_STEPS.length;
