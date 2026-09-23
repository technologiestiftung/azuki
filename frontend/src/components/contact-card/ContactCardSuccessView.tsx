import { content } from "../../content";
import { PrimaryThemedButton } from "../primitives/buttons/PrimaryThemedButton";
import { SecondaryButton } from "../primitives/buttons/SecondaryButton";

interface ContactCardSuccessViewProps {
	email: string;
	onContinue?: () => void;
}

export function ContactCardSuccessView({
	email,
	onContinue,
}: ContactCardSuccessViewProps) {
	const descriptionHtml = content[
		"results.contactCard.bottomSheet.success.description"
	].replace("{email}", email);

	return (
		<div className="flex flex-col gap-2 px-4 pb-5">
			<img
				src="/icons/letter-star.svg"
				alt={content["results.contactCard.bottomSheet.success.illustrationAlt"]}
				className="w-full h-auto absolute top-0 left-0 animate-successIllustrationEnter"
				draggable={false}
			/>
			<div className="flex flex-col gap-2 mb-6 mt-[300px] animate-successContentEnter">
				<h2 className="text-2xl font-semibold leading-[130%] text-sky-900">
					{content["results.contactCard.bottomSheet.success.title"]}
				</h2>
				<p
					className="text-base font-normal text-sky-900 leading-[140%]"
					dangerouslySetInnerHTML={{ __html: descriptionHtml }}
				/>
			</div>
			<div className="flex flex-col gap-3 animate-successCtaEnter">
				<PrimaryThemedButton
					ariaLabel={content["results.contactCard.bottomSheet.success.button"]}
					title={content["results.contactCard.bottomSheet.success.button"]}
					onClick={() => window.open("mailto:", "_blank")}
				>
					{content["results.contactCard.bottomSheet.success.button"]}
				</PrimaryThemedButton>
				{onContinue && (
					<SecondaryButton
						ariaLabel={content["contactPage.success.continue"]}
						title={content["contactPage.success.continue"]}
						onClick={onContinue}
					>
						{content["contactPage.success.continue"]}
					</SecondaryButton>
				)}
			</div>
		</div>
	);
}
