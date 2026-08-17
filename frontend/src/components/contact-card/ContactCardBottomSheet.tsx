import { useEffect, useState, type FormEvent } from "react";
import { content } from "../../content";
import { useCollapsedTitleReveal } from "../collapsing-header/useCollapsedTitleReveal";
import { BottomSheet } from "../primitives/bottom-sheet/BottomSheet";
import { GhostIconButton } from "../primitives/buttons/GhostIconButton";
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
import {
	focusFirstInvalidField,
	omitFormErrors,
	validateRadioFields,
	validateTextFields,
	type ContactType,
	type FormErrors,
	type Under16,
} from "./contactCardFormValidation";

export interface ContactCardBottomSheetProps {
	open: boolean;
	onClose: () => void;
}

const MARKETING_ERROR_ID = "marketing-error";
const FORM_ERROR_ID = "contact-form-error";

export function ContactCardBottomSheet({
	open,
	onClose,
}: ContactCardBottomSheetProps) {
	const [under16, setUnder16] = useState<Under16 | null>(null);
	const [contactType, setContactType] = useState<ContactType | null>(null);
	const [errors, setErrors] = useState<FormErrors>({});

	const { titleRef, titleRevealProgress, updateTitleReveal, resetTitleReveal } =
		useCollapsedTitleReveal({ fadeStartPx: 0, fadeEndPx: -32 });

	useEffect(() => {
		if (open) {
			resetTitleReveal();
		}
	}, [open, resetTitleReveal]);

	const collapsed = titleRevealProgress > 0.5;

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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

		// TODO: send data to API
	};

	const clearError = (...fields: (keyof FormErrors)[]) => {
		setErrors((prev) => omitFormErrors(prev, fields));
	};

	const hasAnyError = Object.keys(errors).length > 0;

	const header = (
		<div className="relative flex items-center px-1.5 py-2">
			<div
				className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-sky-shade-20 transition-opacity duration-150"
				style={{ opacity: collapsed ? 1 : 0 }}
				aria-hidden
			/>
			<GhostIconButton
				className="relative z-10"
				onClick={onClose}
				ariaLabel={content["navigation.back"]}
				iconSrc="/icons/arrow-back-black.svg"
			/>
			<div
				className="pointer-events-none absolute inset-x-0 truncate px-12 text-center text-lg font-semibold text-sky-900 transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.25,0,0.25,1)]"
				style={{
					opacity: titleRevealProgress,
					transform: `translateY(${(1 - titleRevealProgress) * 8}px)`,
				}}
				aria-hidden
			>
				{content["results.contactCard.bottomSheet.title"]}
			</div>
		</div>
	);

	return (
		<BottomSheet
			open={open}
			onClose={onClose}
			ariaLabel={content["results.contactCard.bottomSheet.ariaLabel"]}
			overlayDismissLabel={content["results.filter.dismissOverlay"]}
			header={header}
			onScroll={updateTitleReveal}
		>
			<div className="flex flex-col gap-2 px-4 pb-5">
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
					onSubmit={handleSubmit}
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
								content[
									"results.contactCard.bottomSheet.postalcode.placeholder"
								]
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
									clearError("under16", "birthdate");
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
									clearError("under16", "birthdate");
								}}
								label={content["results.contactCard.bottomSheet.under16.no"]}
							/>
						</FormFieldset>
						{under16 === "yes" && (
							<FormField
								label={
									content["results.contactCard.bottomSheet.birthdate.label"]
								}
								htmlFor="birthdate"
								error={
									errors.birthdate
										? content["results.contactCard.bottomSheet.birthdate.error"]
										: undefined
								}
							>
								<DateInput
									id="birthdate"
									name="birthdate"
									onChange={() => clearError("birthdate")}
									error={errors.birthdate}
								/>
							</FormField>
						)}
					</div>
					<div className="flex flex-col gap-1.5">
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
									content[
										"results.contactCard.bottomSheet.contactType.whatsapp"
									]
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
										? content[
												"results.contactCard.bottomSheet.phonenumber.error"
											]
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
						{contactType === "mail" && (
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
						)}
					</div>
					<div className="flex flex-col gap-1.5">
						<div className="flex items-start gap-2">
							<Checkbox
								id="marketing"
								name="marketing"
								onChange={() => clearError("marketing")}
								error={errors.marketing}
								aria-describedby={
									errors.marketing ? MARKETING_ERROR_ID : undefined
								}
							/>
							<div className="flex flex-col gap-1">
								<label
									htmlFor="marketing"
									className="text-base font-normal leading-[140%] text-gray-700 cursor-pointer"
								>
									{content["results.contactCard.bottomSheet.marketing.label"]}
								</label>
								{errors.marketing && (
									<FieldError id={MARKETING_ERROR_ID}>
										{content["results.contactCard.bottomSheet.marketing.error"]}
									</FieldError>
								)}
							</div>
						</div>
						<span
							className="text-sm font-normal text-gray-500 leading-[140%] [&_a]:underline"
							dangerouslySetInnerHTML={{
								__html:
									content["results.contactCard.bottomSheet.privacy.notice"],
							}}
						/>
					</div>
					{hasAnyError && (
						<FieldError id={FORM_ERROR_ID} className="text-center">
							{content["results.contactCard.bottomSheet.form.error"]}
						</FieldError>
					)}
					<PrimaryThemedButton
						type="submit"
						ariaLabel={content["results.contactCard.bottomSheet.submit"]}
						title={content["results.contactCard.bottomSheet.submit"]}
						className="min-w-0 mt-1"
					>
						{content["results.contactCard.bottomSheet.submit"]}
					</PrimaryThemedButton>
					<span className="text-sm font-normal flex items-center gap-1.5 text-gray-500 leading-[140%] justify-center">
						<img
							src="/icons/lock-gray.svg"
							alt={content["results.contactCard.bottomSheet.lock.alt"]}
							className="size-4"
						/>
						{content["results.contactCard.bottomSheet.dataProtection"]}
					</span>
				</form>
			</div>
		</BottomSheet>
	);
}
