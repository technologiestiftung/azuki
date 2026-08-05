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
	PreferredJob = 6,
	Strengths = 7,
	WorkExpectations = 8,
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
	Step.PreferredJob,
	Step.Strengths,
	Step.WorkExpectations,
	Step.PracticalExperience,
	Step.WorkPreferences,
	Step.NoGos,
];
