import { useCallback, useState, type FormEvent } from "react";
import { submitContactRequest } from "../../api/client";
import { buildContactPayload } from "./buildContactPayload";
import {
	focusFirstInvalidField,
	omitFormErrors,
	validateRadioFields,
	validateTextFields,
	type ContactType,
	type FormErrors,
	type Under16,
} from "./contactCardFormValidation";

/**
 * Form state and submission for the consultation request, shared by the in-app
 * bottom sheet and the standalone page the PDF QR code links to.
 */
export function useContactForm() {
	const [under16, setUnder16] = useState<Under16 | null>(null);
	const [contactType, setContactType] = useState<ContactType | null>(null);
	const [errors, setErrors] = useState<FormErrors>({});
	const [submitted, setSubmitted] = useState(false);
	const [submittedEmail, setSubmittedEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState(false);

	const reset = useCallback(() => {
		setSubmitted(false);
		setSubmittedEmail("");
		setUnder16(null);
		setContactType(null);
		setErrors({});
		setIsSubmitting(false);
		setSubmitError(false);
	}, []);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const errs = {
			...validateTextFields(data),
			...validateRadioFields(data, under16, contactType),
		};
		setErrors(errs);

		if (Object.keys(errs).length > 0) {
			requestAnimationFrame(() => {
				focusFirstInvalidField(errs);
			});
			return;
		}

		const payload = buildContactPayload(data);
		setSubmittedEmail(payload.email);
		setSubmitError(false);
		setIsSubmitting(true);
		try {
			await submitContactRequest(payload);
			setSubmitted(true);
		} catch (err) {
			console.error("Contact form submission failed:", err);
			setSubmitError(true);
		} finally {
			setIsSubmitting(false);
		}
	};

	const clearError = (...fields: (keyof FormErrors)[]) => {
		setErrors((prev) => omitFormErrors(prev, fields));
	};

	return {
		under16,
		setUnder16,
		contactType,
		setContactType,
		errors,
		clearError,
		submitted,
		submittedEmail,
		isSubmitting,
		submitError,
		handleSubmit,
		reset,
	};
}
