import { z } from "zod";

const EducationLevelSchema = z.enum([
	"secondary",
	"extended_secondary",
	"intermediate",
	"none",
	"university_entrance",
	"vocational_diploma",
	"foreign_degree",
	"unknown",
]);

const NoGoAnswerSchema = z.enum(["rejected", "accepted"]);

const WorkPreferenceChoiceSchema = z.enum(["a", "b"]);

const PracticalExperienceEntrySchema = z.object({
	id: z.string(),
	description: z.string(),
	selectedExperienceId: z.string().nullable(),
	selectedExperienceLabel: z.string().nullable(),
	rating: z.number(),
	tags: z.array(z.string()),
});

export const UserProfileSchema = z.object({
	inSchool: z.boolean().nullable(),
	educationLevel: EducationLevelSchema.nullable(),
	favoriteSubjects: z.array(z.string()),
	customSubjects: z.array(z.string()).default([]),
	interests: z.array(z.string()),
	customInterests: z.array(z.string()),
	workExpectations: z.array(z.string()),
	customWorkExpectations: z.array(z.string()).default([]),
	strengths: z.record(z.string(), z.number()),
	customStrengths: z.array(z.string()).default([]),
	selectedCustomStrengths: z.array(z.string()).default([]),
	practicalExperiences: z.array(PracticalExperienceEntrySchema).default([]),
	selectedPracticalExperienceIds: z.array(z.string()).default([]),
	workPreferences: z.record(z.string(), WorkPreferenceChoiceSchema.nullable()),
	noGos: z.record(z.string(), NoGoAnswerSchema.nullable()),
	customNoGos: z.array(z.string()).default([]),
});
