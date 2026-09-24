import { useNavigate } from "react-router-dom";
import type { UIEvent } from "react";
import { content } from "../../content";
import { ROUTE_PATHS } from "../../routing/routes";
import { useCollapsedTitleReveal } from "../collapsing-header/useCollapsedTitleReveal";
import { ContactCardFormContent } from "./ContactCardFormContent";
import { ContactCardHeader } from "./ContactCardHeader";
import { ContactCardSuccessView } from "./ContactCardSuccessView";
import { useContactForm } from "./useContactForm";

const CONTACT_PAGE_ITEMS = [
	content["results.contactCard.item.1"],
	content["results.contactCard.item.2"],
	content["results.contactCard.item.3"],
] as const;

export function ContactPage() {
	const navigate = useNavigate();
	const form = useContactForm();
	const { titleRef, titleRevealProgress, updateTitleReveal } =
		useCollapsedTitleReveal({ fadeStartPx: 0, fadeEndPx: -32 });

	// The app entry point, not /start: a QR visitor has no session, and going
	// straight to the questionnaire would skip whatever gate sits on the root.
	const goToApp = () => {
		navigate(ROUTE_PATHS.root);
	};

	const handleScroll = (event: UIEvent<HTMLDivElement>) => {
		if (!form.submitted) {
			updateTitleReveal(event.currentTarget);
		}
	};

	return (
		<main
			className="flex h-full flex-col bg-sky-white"
			aria-label={content["results.contactCard.bottomSheet.ariaLabel"]}
		>
			{!form.submitted && (
				<ContactCardHeader
					submitted={false}
					collapsed={titleRevealProgress > 0.5}
					titleRevealProgress={titleRevealProgress}
					titleAlign="left"
					title={content["contactPage.title"]}
				/>
			)}
			<div
				className="relative flex-1 overflow-y-auto overflow-x-hidden pb-[env(safe-area-inset-bottom,0px)]"
				onScroll={handleScroll}
			>
				{form.submitted ? (
					<ContactCardSuccessView
						email={form.submittedEmail}
						onContinue={goToApp}
						fillHeight
					/>
				) : (
					<ContactCardFormContent
						titleRef={titleRef}
						showWordmark
						title={content["contactPage.title"]}
						description={content["contactPage.description"]}
						items={CONTACT_PAGE_ITEMS}
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
			</div>
		</main>
	);
}
