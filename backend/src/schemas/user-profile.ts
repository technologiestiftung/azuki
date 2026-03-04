import { z } from "zod";

const EducationLevelSchema = z.enum([
	"secondary",
	"extended_secondary",
	"intermediate",
	"none",
	"university_entrance",
	"unknown",
]);

const NoGoAnswerSchema = z.enum(["rejected", "accepted"]);

const WorkPreferenceChoiceSchema = z.enum(["a", "b"]);

export const UserProfileSchema = z.object({
	educationLevel: EducationLevelSchema.nullable(),
	favoriteSubjects: z.array(z.string()),
	interests: z.array(z.string()),
	customInterests: z.array(z.string()),
	strengths: z.record(z.string(), z.number()),
	secretTalent: z.string(),
	practicalExperience: z.string(),
	workPreferences: z.record(z.string(), WorkPreferenceChoiceSchema.nullable()),
	noGos: z.record(z.string(), NoGoAnswerSchema.nullable()),
});
