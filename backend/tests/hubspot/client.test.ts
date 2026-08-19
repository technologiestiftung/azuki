import { afterEach, describe, expect, it, vi } from "vitest";
import type { ContactRequest } from "../../src/schemas/contact.js";
import {
	buildHubSpotFields,
	buildHubSpotLegalConsentOptions,
	buildHubSpotSubmitBody,
	contactTypeToKontaktweg,
	isoDateToGermanDate,
	submitContactToHubSpot,
} from "../../src/hubspot/client.js";

const HUBSPOT_URL =
	"https://api.hsforms.com/submissions/v3/integration/submit/8886739/c020e6fc-b891-44e3-ab7d-0ccede49b070";

const callRequest: ContactRequest = {
	firstname: "Anna",
	postalcode: "12345",
	contactType: "call",
	phonenumber: "015711223344",
	email: "tester123@joblinge.de",
	birthdate: "2010-01-01",
	marketingConsent: true,
};

const mailRequest: ContactRequest = {
	firstname: "Anna",
	postalcode: "12345",
	contactType: "mail",
	email: "",
	marketingConsent: false,
};

describe("isoDateToGermanDate", () => {
	it("converts YYYY-MM-DD to DD.MM.YYYY", () => {
		expect(isoDateToGermanDate("2010-01-01")).toBe("01.01.2010");
	});
});

describe("contactTypeToKontaktweg", () => {
	it("maps call to Telefon", () => {
		expect(contactTypeToKontaktweg("call")).toBe("Telefon");
	});

	it("maps whatsapp to WhatsApp", () => {
		expect(contactTypeToKontaktweg("whatsapp")).toBe("WhatsApp");
	});

	it("maps mail to E-Mail", () => {
		expect(contactTypeToKontaktweg("mail")).toBe("E-Mail");
	});
});

describe("buildHubSpotFields", () => {
	it("includes phone and geburtsdatum when present", () => {
		expect(buildHubSpotFields(callRequest)).toEqual([
			{ objectTypeId: "0-1", name: "firstname", value: "Anna" },
			{ objectTypeId: "0-1", name: "zip", value: "12345" },
			{
				objectTypeId: "0-1",
				name: "email",
				value: "tester123@joblinge.de",
			},
			{ objectTypeId: "0-1", name: "phone", value: "015711223344" },
			{ objectTypeId: "0-1", name: "geburtsdatum", value: "01.01.2010" },
			{
				objectTypeId: "0-1",
				name: "bevorzugter_kontaktweg",
				value: "Telefon",
			},
			{
				objectTypeId: "0-1",
				name: "LEGAL_CONSENT.subscription_type_11024571",
				value: "true",
			},
			{ objectTypeId: "0-1", name: "point_of_contact", value: "azuki" },
		]);
	});

	it("omits phone and geburtsdatum when absent, but always sends email and consent", () => {
		const fields = buildHubSpotFields(mailRequest);

		expect(fields.some((f) => f.name === "phone")).toBe(false);
		expect(fields.some((f) => f.name === "geburtsdatum")).toBe(false);
		expect(fields).toContainEqual({
			objectTypeId: "0-1",
			name: "email",
			value: "",
		});
		expect(fields).toContainEqual({
			objectTypeId: "0-1",
			name: "LEGAL_CONSENT.subscription_type_11024571",
			value: "false",
		});
		expect(fields).toContainEqual({
			objectTypeId: "0-1",
			name: "point_of_contact",
			value: "azuki",
		});
		expect(fields).toContainEqual({
			objectTypeId: "0-1",
			name: "bevorzugter_kontaktweg",
			value: "E-Mail",
		});
	});
});

describe("buildHubSpotLegalConsentOptions", () => {
	it("carries the marketing checkbox value as a communications subscription", () => {
		expect(buildHubSpotLegalConsentOptions(callRequest)).toEqual({
			consent: {
				consentToProcess: true,
				text: expect.any(String),
				communications: [
					{
						value: true,
						subscriptionTypeId: 11024571,
						text: expect.any(String),
					},
				],
			},
		});
	});

	it("reflects an unchecked marketing checkbox as value: false", () => {
		const options = buildHubSpotLegalConsentOptions(mailRequest);
		expect(options.consent.communications[0].value).toBe(false);
	});
});

describe("buildHubSpotSubmitBody", () => {
	it("wraps fields with the expected envelope", () => {
		expect(buildHubSpotSubmitBody(callRequest, "1700000000000")).toEqual({
			fields: buildHubSpotFields(callRequest),
			submittedAt: "1700000000000",
			context: {},
			legalConsentOptions: buildHubSpotLegalConsentOptions(callRequest),
			skipValidation: true,
		});
	});
});

describe("submitContactToHubSpot", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.unstubAllEnvs();
	});

	it("posts to the HubSpot submit URL with the expected shape", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			text: async () => "",
		});
		vi.stubGlobal("fetch", fetchMock);

		await submitContactToHubSpot(callRequest);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe(HUBSPOT_URL);
		expect(init.method).toBe("POST");
		expect(init.headers).toEqual({ "Content-Type": "application/json" });

		const body = JSON.parse(init.body as string);
		expect(body.fields).toEqual(buildHubSpotFields(callRequest));
		expect(body.context).toEqual({});
		expect(body.legalConsentOptions).toEqual(
			buildHubSpotLegalConsentOptions(callRequest),
		);
		expect(body.skipValidation).toBe(true);
		expect(body.submittedAt).toMatch(/^\d+$/);
	});

	it("throws on a non-2xx HubSpot response", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: false,
				status: 400,
				text: async () => "Bad Request",
			}),
		);

		await expect(submitContactToHubSpot(callRequest)).rejects.toThrow();
	});

	it("propagates (does not swallow) a network failure", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockRejectedValue(new TypeError("fetch failed")),
		);

		await expect(submitContactToHubSpot(callRequest)).rejects.toThrow();
	});

	it("skips the real request when HUBSPOT_MOCK_SUBMIT is true", async () => {
		vi.stubEnv("HUBSPOT_MOCK_SUBMIT", "true");
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);

		await expect(submitContactToHubSpot(callRequest)).resolves.toBeUndefined();

		expect(fetchMock).not.toHaveBeenCalled();
	});
});
