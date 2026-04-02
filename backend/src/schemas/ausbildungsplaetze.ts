import { z } from "zod";

export const AusbildungsplaetzeRequestSchema = z.object({
	plz: z.string().regex(/^\d{5}$/, "PLZ must be exactly 5 digits"),
	berufe: z.array(z.string().min(1)).min(1).max(20),
	umkreis: z.number().int().min(10).max(200).optional().default(25),
});

export type AusbildungsplaetzeRequest = z.infer<typeof AusbildungsplaetzeRequestSchema>;
