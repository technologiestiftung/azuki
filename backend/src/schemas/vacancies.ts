import { z } from "zod";

export const VacanciesRequestSchema = z.object({
	postcode: z.string().regex(/^\d{5}$/, "Postcode must be exactly 5 digits"),
	occupations: z.array(z.string().min(1)).min(1).max(20),
	distance: z.number().int().min(10).max(200).optional().default(25),
});

export type VacanciesRequest = z.infer<typeof VacanciesRequestSchema>;
