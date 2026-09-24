import type { ContactRequest } from "../schemas/contact.js";

const HUBSPOT_OBJECT_TYPE_ID = "0-1";
const HUBSPOT_MARKETING_SUBSCRIPTION_TYPE_ID = 11024571;
const HUBSPOT_LEGAL_CONSENT_FIELD_NAME = `LEGAL_CONSENT.subscription_type_${HUBSPOT_MARKETING_SUBSCRIPTION_TYPE_ID}`;
const POINT_OF_CONTACT_FIELD_NAME = "point_of_contact";
const POINT_OF_CONTACT_VALUE = "azuki";
const REQUEST_TIMEOUT_MS = 8000;

// HubSpot requires this exact text as the legal basis for processing
// (`consentToProcess`) and for the marketing subscription checkbox (`communications[].text`).
const CONSENT_TO_PROCESS_TEXT =
	"Weitere Informationen zu unseren Datenschutzverfahren und dazu, wie wir deine Privatsphäre schützen und respektieren, findest du in unserer Datenschutzrichtlinie.";
const MARKETING_CONSENT_TEXT =
	"Ich stimme zu von PLAN A über Angebote und andere Inhalte benachrichtigt zu werden.";

interface HubSpotField {
	objectTypeId: string;
	name: string;
	value: string;
}

interface HubSpotLegalConsentOptions {
	consent: {
		consentToProcess: true;
		text: string;
		communications: {
			value: boolean;
			subscriptionTypeId: number;
			text: string;
		}[];
	};
}

interface HubSpotSubmitBody {
	fields: HubSpotField[];
	submittedAt: string;
	context: Record<string, never>;
	legalConsentOptions: HubSpotLegalConsentOptions;
	skipValidation: true;
}

export function contactTypeToKontaktweg(
	contactType: ContactRequest["contactType"],
): "Telefon" | "WhatsApp" | "E-Mail" {
	switch (contactType) {
		case "call":
			return "Telefon";
		case "whatsapp":
			return "WhatsApp";
		case "mail":
			return "E-Mail";
		default:
			throw new Error(`Unknown contact type: ${String(contactType)}`);
	}
}

export function isoDateToDDMMYYYY(iso: string): string {
	const [year, month, day] = iso.split("-");
	return `${day}/${month}/${year}`;
}

function field(name: string, value: string): HubSpotField {
	return { objectTypeId: HUBSPOT_OBJECT_TYPE_ID, name, value };
}

export function buildHubSpotFields(request: ContactRequest): HubSpotField[] {
	const fields: HubSpotField[] = [
		field("firstname", request.firstname),
		field("zip", request.postalcode),
		field("email", request.email),
	];
	if (request.phonenumber !== undefined) {
		fields.push(field("phone", request.phonenumber));
	}
	if (request.birthdate !== undefined) {
		fields.push(field("geburtsdatum", isoDateToDDMMYYYY(request.birthdate)));
	}
	fields.push(
		field(
			"bevorzugter_kontaktweg",
			contactTypeToKontaktweg(request.contactType),
		),
		field(
			HUBSPOT_LEGAL_CONSENT_FIELD_NAME,
			request.marketingConsent ? "true" : "false",
		),
		field(POINT_OF_CONTACT_FIELD_NAME, POINT_OF_CONTACT_VALUE),
	);
	return fields;
}

export function buildHubSpotLegalConsentOptions(
	request: ContactRequest,
): HubSpotLegalConsentOptions {
	return {
		consent: {
			consentToProcess: true,
			text: CONSENT_TO_PROCESS_TEXT,
			communications: [
				{
					value: request.marketingConsent,
					subscriptionTypeId: HUBSPOT_MARKETING_SUBSCRIPTION_TYPE_ID,
					text: MARKETING_CONSENT_TEXT,
				},
			],
		},
	};
}

export function buildHubSpotSubmitBody(
	request: ContactRequest,
	submittedAt: string,
): HubSpotSubmitBody {
	return {
		fields: buildHubSpotFields(request),
		submittedAt,
		context: {},
		legalConsentOptions: buildHubSpotLegalConsentOptions(request),
		skipValidation: true,
	};
}

export async function submitContactToHubSpot(
	request: ContactRequest,
): Promise<void> {
	const body = buildHubSpotSubmitBody(request, String(Date.now()));

	if (process.env.HUBSPOT_MOCK_SUBMIT === "true") {
		console.warn(
			"[hubspot] HUBSPOT_MOCK_SUBMIT=true — skipping real submission:",
			body,
		);
		return;
	}

	const submitUrl = process.env.HUBSPOT_FORMS_SUBMIT_URL;
	if (!submitUrl) {
		throw new Error("HUBSPOT_FORMS_SUBMIT_URL must be set");
	}

	const res = await fetch(submitUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`HubSpot submit failed: ${res.status} ${text}`.trim());
	}
}
