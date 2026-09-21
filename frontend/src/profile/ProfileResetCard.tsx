import { useState } from "react";
import { SecondaryButton } from "../components/primitives/buttons/SecondaryButton";
import { content } from "../content";
import { ResetDialog } from "../components/ResetDialog";
import { downloadProfile } from "./downloadProfile";

export function ProfileResetCard() {
	const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

	return (
		<>
			<div className="flex flex-col gap-5 rounded-2xl bg-white py-5 px-3">
				<div className="flex flex-col gap-[7px]">
					<h3 className="text-2xl font-semibold text-sky-900 text-center">
						{content["profile.resetCard.title"]}
					</h3>
					<p className="text-lg font-normal text-sky-900 text-center">
						{content["profile.resetCard.description"]}
					</p>
				</div>
				<SecondaryButton
					className="w-full flex items-center justify-center gap-2"
					onClick={() => setIsResetDialogOpen(true)}
					ariaLabel={content["profile.resetCard.cta"]}
					title={content["profile.resetCard.cta"]}
				>
					<img src="/icons/refresh.svg" alt="" className="w-6 h-6" />
					{content["profile.resetCard.cta"]}
				</SecondaryButton>
			</div>
			<ResetDialog
				isOpen={isResetDialogOpen}
				onClose={() => setIsResetDialogOpen(false)}
				download={downloadProfile}
				title={content["profile.resetDialog.title"]}
				description={content["profile.resetDialog.description"]}
				downloadLabel={content["profile.resetDialog.downloadCta"]}
			/>
		</>
	);
}
