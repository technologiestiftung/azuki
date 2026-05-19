import { z } from "zod";
import { UserProfileSchema } from "../schemas/userProfile.js";

const PersonaInputBase = {
	name: z.string().min(1).max(80),
	description: z.string().nullable().optional(),
	profile: UserProfileSchema,
	tierS: z.array(z.number().int()).default([]),
	tierA: z.array(z.number().int()).default([]),
	tierC: z.array(z.number().int()).default([]),
};

export const CreatePersonaSchema = z.object(PersonaInputBase);
export const UpdatePersonaSchema = z.object(PersonaInputBase);
