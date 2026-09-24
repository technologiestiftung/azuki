import { content } from "../../content";
import { PrimaryThemedButton } from "../primitives/buttons/PrimaryThemedButton";
import { Checkbox } from "../primitives/form/Checkbox";
import { DateInput } from "../primitives/form/DateInput";
import {
	FieldError,
	FormField,
	FormFieldset,
} from "../primitives/form/FormField";
import { FormTextInput } from "../primitives/form/FormTextInput";
import { RadioOption } from "../primitives/form/Radio";
import type {
	ContactType,
	FormErrors,
	Under16,
} from "./contactCardFormValidation";
import type { FormEvent, RefObject } from "react";

const FORM_ERROR_ID = "contact-form-error";

interface ContactCardFormContentProps {
	titleRef: RefObject<HTMLHeadingElement>;
	showWordmark?: boolean;
	under16: Under16 | null;
	setUnder16: (v: Under16) => void;
	contactType: ContactType | null;
	setContactType: (v: ContactType) => void;
	errors: FormErrors;
	clearError: (...fields: (keyof FormErrors)[]) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	isSubmitting: boolean;
	submitError: boolean;
}

export function ContactCardFormContent({
	titleRef,
	showWordmark = false,
	under16,
	setUnder16,
	contactType,
	setContactType,
	errors,
	clearError,
	onSubmit,
	isSubmitting,
	submitError,
}: ContactCardFormContentProps) {
	const hasAnyError = Object.keys(errors).length > 0;
	const birthdateError = errors.birthdate
		? content["results.contactCard.bottomSheet.birthdate.error"]
		: undefined;
	const birthdateMismatchError = errors.birthdateMismatch
		? content["results.contactCard.bottomSheet.birthdate.mismatchError"]
		: undefined;
	const birthdateFieldError = birthdateError ?? birthdateMismatchError;

	return (
		<div className="flex flex-col gap-2 px-4 pb-5">
			{showWordmark && (
				<img
					src="/illustrations/azuki-wordmark.svg"
					alt=""
					className="mx-auto mb-4 w-[130px] object-contain"
				/>
			)}
			<h2
				ref={titleRef}
				className="text-2xl font-semibold leading-[130%] text-sky-900"
			>
				{content["results.contactCard.bottomSheet.title"]}
			</h2>
			<p
				className="text-base font-normal text-sky-900 leading-[140%]"
				dangerouslySetInnerHTML={{
					__html: content["results.contactCard.bottomSheet.description"],
				}}
			/>
			<form
				onSubmit={onSubmit}
				noValidate
				className="flex flex-col gap-6 mt-4"
				aria-describedby={hasAnyError ? FORM_ERROR_ID : undefined}
			>
				<FormField
					label={content["results.contactCard.bottomSheet.firstname.label"]}
					htmlFor="firstname"
					error={
						errors.firstname
							? content["results.contactCard.bottomSheet.firstname.error"]
							: undefined
					}
				>
					<FormTextInput
						id="firstname"
						name="firstname"
						autoComplete="given-name"
						placeholder={
							content["results.contactCard.bottomSheet.firstname.placeholder"]
						}
						onChange={() => clearError("firstname")}
						error={errors.firstname}
					/>
				</FormField>
				<FormField
					label={content["results.contactCard.bottomSheet.postalcode.label"]}
					htmlFor="postalcode"
					error={
						errors.postalcode
							? content["results.contactCard.bottomSheet.postalcode.error"]
							: undefined
					}
				>
					<FormTextInput
						type="text"
						inputMode="numeric"
						autoComplete="postal-code"
						id="postalcode"
						name="postalcode"
						placeholder={
							content["results.contactCard.bottomSheet.postalcode.placeholder"]
						}
						onChange={() => clearError("postalcode")}
						error={errors.postalcode}
					/>
				</FormField>
				<div className="flex flex-col gap-1.5">
					<FormFieldset
						id="under16"
						legend={content["results.contactCard.bottomSheet.under16.legend"]}
						error={
							errors.under16
								? content["results.contactCard.bottomSheet.under16.error"]
								: undefined
						}
					>
						<RadioOption
							className="mt-1"
							id="under16-yes"
							name="under16"
							value="yes"
							checked={under16 === "yes"}
							onChange={() => {
								setUnder16("yes");
								clearError("under16", "birthdate", "birthdateMismatch");
							}}
							label={content["results.contactCard.bottomSheet.under16.yes"]}
						/>
						<RadioOption
							className="mb-1"
							id="under16-no"
							name="under16"
							value="no"
							checked={under16 === "no"}
							onChange={() => {
								setUnder16("no");
								clearError("under16", "birthdate", "birthdateMismatch");
							}}
							label={content["results.contactCard.bottomSheet.under16.no"]}
						/>
					</FormFieldset>
					{under16 === "yes" && (
						<FormField
							label={content["results.contactCard.bottomSheet.birthdate.label"]}
							htmlFor="birthdate"
							error={birthdateFieldError}
						>
							<DateInput
								id="birthdate"
								name="birthdate"
								onChange={() => clearError("birthdate", "birthdateMismatch")}
								error={errors.birthdate || errors.birthdateMismatch}
							/>
						</FormField>
					)}
				</div>
				<FormField
					label={content["results.contactCard.bottomSheet.email.label"]}
					htmlFor="email"
					error={
						errors.email
							? content["results.contactCard.bottomSheet.email.error"]
							: undefined
					}
				>
					<FormTextInput
						type="email"
						autoComplete="email"
						id="email"
						name="email"
						placeholder={
							content["results.contactCard.bottomSheet.email.placeholder"]
						}
						onChange={() => clearError("email")}
						error={errors.email}
					/>
				</FormField>
				<div className="flex flex-col gap-6">
					<FormFieldset
						id="contactType"
						legend={
							content["results.contactCard.bottomSheet.contactType.legend"]
						}
						error={
							errors.contactType
								? content["results.contactCard.bottomSheet.contactType.error"]
								: undefined
						}
					>
						<RadioOption
							className="mt-1"
							id="contact-call"
							name="contactType"
							value="call"
							checked={contactType === "call"}
							onChange={() => {
								setContactType("call");
								clearError("contactType", "phonenumber", "email");
							}}
							label={
								content["results.contactCard.bottomSheet.contactType.call"]
							}
						/>
						<RadioOption
							id="contact-whatsapp"
							name="contactType"
							value="whatsapp"
							checked={contactType === "whatsapp"}
							onChange={() => {
								setContactType("whatsapp");
								clearError("contactType", "phonenumber", "email");
							}}
							label={
								content["results.contactCard.bottomSheet.contactType.whatsapp"]
							}
						/>
						<RadioOption
							className="mb-1"
							id="contact-mail"
							name="contactType"
							value="mail"
							checked={contactType === "mail"}
							onChange={() => {
								setContactType("mail");
								clearError("contactType", "phonenumber", "email");
							}}
							label={
								content["results.contactCard.bottomSheet.contactType.mail"]
							}
						/>
					</FormFieldset>
					{(contactType === "call" || contactType === "whatsapp") && (
						<FormField
							label={
								content["results.contactCard.bottomSheet.phonenumber.label"]
							}
							htmlFor="phonenumber"
							error={
								errors.phonenumber
									? content["results.contactCard.bottomSheet.phonenumber.error"]
									: undefined
							}
						>
							<FormTextInput
								type="tel"
								autoComplete="tel"
								id="phonenumber"
								name="phonenumber"
								placeholder={
									content[
										"results.contactCard.bottomSheet.phonenumber.placeholder"
									]
								}
								onChange={() => clearError("phonenumber")}
								error={errors.phonenumber}
							/>
						</FormField>
					)}
				</div>
				<div className="flex flex-col gap-1.5">
					<div className="flex items-start gap-2">
						<Checkbox id="marketing" name="marketing" />
						<div className="flex flex-col gap-1">
							<label
								htmlFor="marketing"
								className="text-base font-normal leading-[140%] text-sky-shade-170 cursor-pointer"
							>
								{content["results.contactCard.bottomSheet.marketing.label"]}
							</label>
						</div>
					</div>
					<span
						className="text-sm font-normal text-sky-shade-120 leading-[140%] [&_a]:underline"
						dangerouslySetInnerHTML={{
							__html: content["results.contactCard.bottomSheet.privacy.notice"],
						}}
					/>
				</div>
				{hasAnyError && (
					<FieldError id={FORM_ERROR_ID} className="text-center">
						{content["results.contactCard.bottomSheet.form.error"]}
					</FieldError>
				)}
				{submitError && (
					<FieldError id="contact-submit-error" className="text-center">
						{content["results.contactCard.bottomSheet.submit.error"]}
					</FieldError>
				)}
				<PrimaryThemedButton
					type="submit"
					disabled={isSubmitting}
					ariaLabel={content["results.contactCard.bottomSheet.submit"]}
					title={content["results.contactCard.bottomSheet.submit"]}
					className="min-w-0 mt-1"
				>
					{isSubmitting
						? content["results.contactCard.bottomSheet.submit.loading"]
						: content["results.contactCard.bottomSheet.submit"]}
				</PrimaryThemedButton>
				<span className="text-sm font-normal flex items-center gap-1.5 text-sky-shade-110 leading-[140%] justify-center">
					<img
						src="/icons/lock-gray.svg"
						alt={content["results.contactCard.bottomSheet.lock.alt"]}
						className="size-4"
					/>
					{content["results.contactCard.bottomSheet.dataProtection"]}
				</span>
			</form>
		</div>
	);
}
