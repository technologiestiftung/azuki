import { z } from "zod";

export const UserProfileSchema = z.object({
	educationLevel: z.string().nullable(),
	favoriteSubjects: z.array(z.string()),
	interests: z.array(z.string()),
	customInterests: z.array(z.string()),
	strengths: z.record(z.string(), z.number()),
	secretTalent: z.string(),
	practicalExperience: z.string(),
	workPreferences: z.record(z.string(), z.string().nullable()),
	noGos: z.record(z.string(), z.string().nullable()),
});
