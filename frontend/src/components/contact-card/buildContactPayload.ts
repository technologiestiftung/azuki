import type { ContactType, Under16 } from "./contactCardFormValidation";

export interface ContactRequestPayload {
	firstname: string;
	postalcode: string;
	contactType: ContactType;
	phonenumber?: string;
	email: string;
	birthdate?: string;
	marketingConsent: boolean;
}

export function buildContactPayload(data: FormData): ContactRequestPayload {
	const firstname = ((data.get("firstname") as string | null) ?? "").trim();
	const postalcode = ((data.get("postalcode") as string | null) ?? "").trim();
	const contactType = data.get("contactType") as ContactType;
	const email = ((data.get("email") as string | null) ?? "").trim();
	const under16 = data.get("under16") as Under16 | null;
	const marketingConsent = data.get("marketing") === "on";

	const payload: ContactRequestPayload = {
		firstname,
		postalcode,
		contactType,
		email,
		marketingConsent,
	};

	if (contactType === "call" || contactType === "whatsapp") {
		const phonenumber = (
			(data.get("phonenumber") as string | null) ?? ""
		).trim();
		if (phonenumber) {
			payload.phonenumber = phonenumber;
		}
	}

	if (under16 === "yes") {
		const birthdate = ((data.get("birthdate") as string | null) ?? "").trim();
		if (birthdate) {
			payload.birthdate = birthdate;
		}
	}

	return payload;
}
