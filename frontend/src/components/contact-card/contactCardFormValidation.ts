export type Under16 = "yes" | "no";
export type ContactType = "call" | "whatsapp" | "mail";

export type FormErrors = {
	firstname?: boolean;
	postalcode?: boolean;
	under16?: boolean;
	birthdate?: boolean;
	contactType?: boolean;
	phonenumber?: boolean;
	email?: boolean;
};

export const FORM_FIELD_FOCUS_ORDER: {
	key: keyof FormErrors;
	focusId: string;
}[] = [
	{ key: "firstname", focusId: "firstname" },
	{ key: "postalcode", focusId: "postalcode" },
	{ key: "under16", focusId: "under16-yes" },
	{ key: "birthdate", focusId: "birthdate" },
	{ key: "contactType", focusId: "contact-call" },
	{ key: "phonenumber", focusId: "phonenumber" },
	{ key: "email", focusId: "email" },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9]{8,15}$/;

export function isValidEmail(value: string): boolean {
	return EMAIL_PATTERN.test(value);
}

export function isValidPhone(value: string): boolean {
	const normalized = value.replace(/[\s\-()/]/g, "");
	return PHONE_PATTERN.test(normalized);
}

export function validateTextFields(data: FormData): FormErrors {
	const errs: FormErrors = {};
	const firstname = (data.get("firstname") as string | null)?.trim() ?? "";
	if (!firstname) {
		errs.firstname = true;
	}
	const postalcode = (data.get("postalcode") as string | null)?.trim() ?? "";
	if (!postalcode || !/^\d{5}$/.test(postalcode)) {
		errs.postalcode = true;
	}
	return errs;
}

export function validateRadioFields(
	data: FormData,
	under16: Under16 | null,
	contactType: ContactType | null,
): FormErrors {
	const errs: FormErrors = {};
	if (!under16) {
		errs.under16 = true;
	}
	if (under16 === "yes") {
		const birthdate = (data.get("birthdate") as string | null)?.trim() ?? "";
		if (!birthdate) {
			errs.birthdate = true;
		}
	}
	if (!contactType) {
		errs.contactType = true;
	}
	if (contactType === "call" || contactType === "whatsapp") {
		const phonenumber =
			(data.get("phonenumber") as string | null)?.trim() ?? "";
		if (!phonenumber || !isValidPhone(phonenumber)) {
			errs.phonenumber = true;
		}
	}
	if (contactType === "mail") {
		const email = (data.get("email") as string | null)?.trim() ?? "";
		if (!email || !isValidEmail(email)) {
			errs.email = true;
		}
	}
	return errs;
}

export function omitFormErrors(
	prev: FormErrors,
	fields: (keyof FormErrors)[],
): FormErrors {
	return Object.fromEntries(
		Object.entries(prev).filter(
			([key]) => !fields.includes(key as keyof FormErrors),
		),
	);
}

export function focusFirstInvalidField(errors: FormErrors): void {
	for (const { key, focusId } of FORM_FIELD_FOCUS_ORDER) {
		if (!errors[key]) {
			continue;
		}
		const el = document.getElementById(focusId);
		if (el && typeof el.focus === "function") {
			el.focus();
			return;
		}
	}
}
