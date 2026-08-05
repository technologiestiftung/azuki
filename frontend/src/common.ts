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
	Welcome = 1,
	Start = 2,
	InSchool = 3,
	SchoolDegreeStep = 4,
	SchoolSubjects = 5,
	Interests = 6,
	PreferredJob = 7,
	Strengths = 8,
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
	Step.PreferredJob,
	Step.Strengths,
	Step.WorkExpectations,
	Step.PracticalExperience,
	Step.WorkPreferences,
	Step.NoGos,
];

export const TOTAL_QUESTIONNAIRE_STEPS = QUESTIONNAIRE_STEPS.length;
