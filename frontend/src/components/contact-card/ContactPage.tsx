import { useNavigate } from "react-router-dom";
import type { UIEvent } from "react";
import { content } from "../../content";
import { ROUTE_PATHS } from "../../routing/routes";
import { hasProfileSession } from "../../routing/sessionGuard";
import { useCollapsedTitleReveal } from "../collapsing-header/useCollapsedTitleReveal";
import { ContactCardFormContent } from "./ContactCardFormContent";
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

	// With a cached questionnaire the visitor already has a profile to return to;
	// a QR visitor without one goes to the app entry point, not /start, so that
	// whatever gate sits on the root still applies.
	const goToApp = () => {
		navigate(hasProfileSession() ? ROUTE_PATHS.profile : ROUTE_PATHS.root);
	};

	const handleScroll = (event: UIEvent<HTMLDivElement>) => {
		if (!form.submitted) {
			updateTitleReveal(event.currentTarget);
		}
	};

	return (
		<main
			className="relative flex h-full flex-col bg-sky-white"
			aria-label={content["results.contactCard.bottomSheet.ariaLabel"]}
		>
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
					<>
						<div className="flex items-center px-4 pt-1 pb-2">
							<button
								type="button"
								onClick={goToApp}
								className="group inline-flex items-center gap-1.5 text-base font-medium text-sky-shade-110 focus-visible:outline-none"
							>
								<span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors active:bg-sky-shade-20 group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-sky-500 md:hover:bg-sky-shade-20">
									<img
										src="/icons/arrow-back-light.svg"
										alt=""
										className="h-5 w-5"
									/>
								</span>
								{content["contactPage.back"]}
							</button>
						</div>
						<ContactCardFormContent
							titleRef={titleRef}
							showWordmark
							boxedIntro
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
					</>
				)}
			</div>
			{/* Overlays the content instead of taking layout space, so nothing shifts
			    when it fades in. Nothing inside is interactive, hence inert to clicks. */}
			{!form.submitted && (
				<div
					className="pointer-events-none absolute inset-x-0 top-0 z-10 flex min-h-[52px] items-center bg-sky-white px-4 transition-opacity duration-150 ease-[cubic-bezier(0.25,0,0.25,1)]"
					style={{ opacity: titleRevealProgress }}
					aria-hidden
				>
					<div
						className="absolute inset-x-0 bottom-0 h-0.5 bg-sky-shade-20"
						aria-hidden
					/>
					<span className="truncate text-base font-semibold leading-[140%] text-sky-900">
						{content["contactPage.title"]}
					</span>
				</div>
			)}
		</main>
	);
}
