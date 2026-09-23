import { describe, expect, it } from "vitest";
import { ContactRequestSchema } from "../../src/schemas/contact.js";

const validBase = {
	firstname: "Anna",
	postalcode: "12345",
	contactType: "mail" as const,
	email: "anna@example.com",
	marketingConsent: true,
};

describe("ContactRequestSchema email validation", () => {
	it("accepts a well-formed email", () => {
		expect(ContactRequestSchema.safeParse(validBase).success).toBe(true);
	});

	it("rejects an empty email", () => {
		const result = ContactRequestSchema.safeParse({
			...validBase,
			email: "",
		});
		expect(result.success).toBe(false);
	});

	it("rejects a string with no @ or domain", () => {
		const result = ContactRequestSchema.safeParse({
			...validBase,
			email: "not-an-email",
		});
		expect(result.success).toBe(false);
	});

	it("accepts addresses the frontend's own validation accepts", () => {
		const addresses = ["a@b.c", "jörg@müller.de", "anna@exämple.de"];
		for (const email of addresses) {
			const result = ContactRequestSchema.safeParse({
				...validBase,
				email,
			});
			expect(result.success).toBe(true);
		}
	});
});
