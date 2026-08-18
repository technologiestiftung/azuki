import { describe, expect, it } from "vitest";
import { buildContactPayload } from "../../src/components/contact-card/buildContactPayload";

function makeFormData(fields: Record<string, string>): FormData {
	const data = new FormData();
	for (const [key, value] of Object.entries(fields)) {
		data.set(key, value);
	}
	return data;
}

describe("buildContactPayload", () => {
	it("builds the full call-path payload and never forwards under16", () => {
		const data = makeFormData({
			firstname: " Anna ",
			postalcode: "12345",
			under16: "yes",
			birthdate: "2010-01-01",
			contactType: "call",
			phonenumber: " 0157 11223344 ",
			email: "",
		});

		const result = buildContactPayload(data);

		expect(result).toEqual({
			firstname: "Anna",
			postalcode: "12345",
			contactType: "call",
			phonenumber: "0157 11223344",
			birthdate: "2010-01-01",
			email: "",
			marketingConsent: false,
		});
		expect("under16" in result).toBe(false);
	});

	it("omits phonenumber and birthdate for the mail contact path", () => {
		const data = makeFormData({
			firstname: "Anna",
			postalcode: "12345",
			contactType: "mail",
			email: "test@example.com",
		});

		const result = buildContactPayload(data);

		expect("phonenumber" in result).toBe(false);
		expect("birthdate" in result).toBe(false);
		expect(result.email).toBe("test@example.com");
	});

	it("omits birthdate when under16 is no", () => {
		const data = makeFormData({
			firstname: "Anna",
			postalcode: "12345",
			under16: "no",
			contactType: "whatsapp",
			phonenumber: "015711223344",
			email: "",
		});

		const result = buildContactPayload(data);

		expect("birthdate" in result).toBe(false);
	});

	it("maps the marketing checkbox to a boolean", () => {
		const checked = makeFormData({
			firstname: "Anna",
			postalcode: "12345",
			contactType: "mail",
			email: "test@example.com",
			marketing: "on",
		});
		const unchecked = makeFormData({
			firstname: "Anna",
			postalcode: "12345",
			contactType: "mail",
			email: "test@example.com",
		});

		expect(buildContactPayload(checked).marketingConsent).toBe(true);
		expect(buildContactPayload(unchecked).marketingConsent).toBe(false);
	});

	it("trims whitespace from string fields", () => {
		const data = makeFormData({
			firstname: "  Anna  ",
			postalcode: " 12345 ",
			contactType: "call",
			phonenumber: " 015711223344 ",
			email: " test@example.com ",
		});

		const result = buildContactPayload(data);

		expect(result.firstname).toBe("Anna");
		expect(result.postalcode).toBe("12345");
		expect(result.phonenumber).toBe("015711223344");
		expect(result.email).toBe("test@example.com");
	});
});
