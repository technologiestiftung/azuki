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

export const UserProfileSchema = z.object({
	inSchool: z.boolean().nullable(),
	educationLevel: EducationLevelSchema.nullable(),
	favoriteSubjects: z.array(z.string()),
	customSubjects: z.array(z.string()).default([]),
	interests: z.array(z.string()),
	customInterests: z.array(z.string()),
	workValues: z.array(z.string()),
	strengths: z.record(z.string(), z.number()),
	secretTalent: z.string(),
	practicalExperience: z.string(),
	workPreferences: z.record(z.string(), WorkPreferenceChoiceSchema.nullable()),
	noGos: z.record(z.string(), NoGoAnswerSchema.nullable()),
});

export const MatchRequestSchema = z.object({
	profile: UserProfileSchema,
	model: z.string().optional(),
});
