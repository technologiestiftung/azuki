import { useEffect } from "react";
import { content } from "../../content";
import { useCollapsedTitleReveal } from "../collapsing-header/useCollapsedTitleReveal";
import { BottomSheet } from "../primitives/bottom-sheet/BottomSheet";
import { ContactCardFormContent } from "./ContactCardFormContent";
import { ContactCardHeader } from "./ContactCardHeader";
import { ContactCardSuccessView } from "./ContactCardSuccessView";
import { useContactForm } from "./useContactForm";

export interface ContactCardBottomSheetProps {
	open: boolean;
	onClose: () => void;
}

export function ContactCardBottomSheet({
	open,
	onClose,
}: ContactCardBottomSheetProps) {
	const form = useContactForm();

	const { titleRef, titleRevealProgress, updateTitleReveal, resetTitleReveal } =
		useCollapsedTitleReveal({ fadeStartPx: 0, fadeEndPx: -32 });

	const { reset } = form;
	useEffect(() => {
		if (!open) {
			return;
		}
		resetTitleReveal();
		reset();
	}, [open, reset, resetTitleReveal]);

	return (
		<BottomSheet
			open={open}
			onClose={onClose}
			ariaLabel={content["results.contactCard.bottomSheet.ariaLabel"]}
			overlayDismissLabel={content["results.filter.dismissOverlay"]}
			header={
				<ContactCardHeader
					submitted={form.submitted}
					collapsed={titleRevealProgress > 0.5}
					titleRevealProgress={titleRevealProgress}
					onDismiss={onClose}
					dismissIconSrc="/icons/arrow-back-black.svg"
					dismissAriaLabel={
						form.submitted
							? content["common.bottomSheet.overlayDismissLabel"]
							: content["navigation.back"]
					}
				/>
			}
			onScroll={form.submitted ? undefined : updateTitleReveal}
		>
			{form.submitted ? (
				<ContactCardSuccessView email={form.submittedEmail} />
			) : (
				<ContactCardFormContent
					titleRef={titleRef}
					under16={form.under16}
					setUnder16={form.setUnder16}
					contactType={form.contactType}
					setContactType={form.setContactType}
					errors={form.errors}
					clearError={form.clearError}
					onSubmit={form.handleSubmit}
					isSubmitting={form.isSubmitting}
					submitError={form.submitError}
				/>
			)}
		</BottomSheet>
	);
}
