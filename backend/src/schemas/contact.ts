import { z } from "zod";

export const ContactRequestSchema = z.object({
	firstname: z.string().trim().min(1),
	postalcode: z.string().regex(/^\d{5}$/),
	contactType: z.enum(["call", "whatsapp", "mail"]),
	phonenumber: z.string().trim().min(1).optional(),
	email: z.string().trim(),
	birthdate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.optional(),
	marketingConsent: z.boolean(),
});

export type ContactRequest = z.infer<typeof ContactRequestSchema>;
