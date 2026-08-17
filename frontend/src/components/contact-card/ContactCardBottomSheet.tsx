import { useEffect, useState, type FormEvent } from "react";
import { content } from "../../content";
import { useCollapsedTitleReveal } from "../collapsing-header/useCollapsedTitleReveal";
import { BottomSheet } from "../primitives/bottom-sheet/BottomSheet";
import { GhostIconButton } from "../primitives/buttons/GhostIconButton";
import {
	focusFirstInvalidField,
	omitFormErrors,
	validateRadioFields,
	validateTextFields,
	type ContactType,
	type FormErrors,
	type Under16,
} from "./contactCardFormValidation";
import { ContactCardFormContent } from "./ContactCardFormContent";
import { ContactCardSuccessView } from "./ContactCardSuccessView";

export interface ContactCardBottomSheetProps {
	open: boolean;
	onClose: () => void;
}

export function ContactCardBottomSheet({
	open,
	onClose,
}: ContactCardBottomSheetProps) {
	const [under16, setUnder16] = useState<Under16 | null>(null);
	const [contactType, setContactType] = useState<ContactType | null>(null);
	const [errors, setErrors] = useState<FormErrors>({});
	const [submitted, setSubmitted] = useState(false);
	const [submittedEmail, setSubmittedEmail] = useState("");

	const { titleRef, titleRevealProgress, updateTitleReveal, resetTitleReveal } =
		useCollapsedTitleReveal({ fadeStartPx: 0, fadeEndPx: -32 });

	useEffect(() => {
		if (open) {
			resetTitleReveal();
		} else {
			setSubmitted(false);
			setSubmittedEmail("");
			setUnder16(null);
			setContactType(null);
			setErrors({});
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

		const email = (data.get("email") as string | null) ?? "";
		setSubmittedEmail(email);
		// TODO: send data to API
		setSubmitted(true);
	};

	const clearError = (...fields: (keyof FormErrors)[]) => {
		setErrors((prev) => omitFormErrors(prev, fields));
	};

	const header = (
		<div
			className={`relative flex items-center px-4 py-2 ${
				submitted ? "justify-end" : ""
			}`}
		>
			<div
				className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-sky-shade-20 transition-opacity duration-150"
				style={{ opacity: collapsed && !submitted ? 1 : 0 }}
				aria-hidden
			/>
			{submitted ? (
				<button
					type="button"
					className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-sky-shade-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
					onClick={onClose}
					aria-label={content["common.bottomSheet.overlayDismissLabel"]}
				>
					<img src="/icons/close-gray.svg" alt="" className="h-6 w-6" />
				</button>
			) : (
				<GhostIconButton
					className="relative z-10"
					onClick={onClose}
					ariaLabel={content["navigation.back"]}
					iconSrc="/icons/arrow-back-black.svg"
				/>
			)}
			{!submitted && (
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
			)}
		</div>
	);

	return (
		<BottomSheet
			open={open}
			onClose={onClose}
			ariaLabel={content["results.contactCard.bottomSheet.ariaLabel"]}
			overlayDismissLabel={content["results.filter.dismissOverlay"]}
			header={header}
			onScroll={submitted ? undefined : updateTitleReveal}
		>
			{submitted ? (
				<ContactCardSuccessView email={submittedEmail} />
			) : (
				<ContactCardFormContent
					titleRef={titleRef}
					under16={under16}
					setUnder16={setUnder16}
					contactType={contactType}
					setContactType={setContactType}
					errors={errors}
					clearError={clearError}
					onSubmit={handleSubmit}
				/>
			)}
		</BottomSheet>
	);
}
