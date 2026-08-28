import { useState } from "react";
import { content } from "../../content";
import { ResetDialog } from "../ResetDialog";

interface BottomCardProps {
	handleDownload: () => void;
}

export function BottomCard({ handleDownload }: BottomCardProps) {
	const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

	return (
		<>
			<div className="flex flex-col gap-5 px-3 mt-7 items-center justify-center">
				<div className="flex flex-col gap-[7px]">
					<h3 className="text-2xl font-semibold text-sky-900 text-center">
						{content["results.bottomCard.title"]}
					</h3>
					<p className="text-lg text-sky-900 leading-6 text-center">
						{content["results.bottomCard.description"]}
					</p>
				</div>
				<img
					className="py-[15px] h-[92px]"
					src="/illustrations/binoculars.svg"
				/>
				<div className="w-full py-[13px]">
					<button
						onClick={() => setIsResetDialogOpen(true)}
						aria-label={content["results.bottomCard.resetCta"]}
						title={content["results.bottomCard.resetCta"]}
						className="w-full flex gap-2 items-center justify-center text-sky-900 font-medium underline underline-offset-[1.92px] hover:text-sky-800 active:text-sky-800"
					>
						<img src="/icons/refresh.svg" className="w-6 h-6" />
						{content["results.bottomCard.resetCta"]}
					</button>
				</div>
			</div>
			<ResetDialog
				isOpen={isResetDialogOpen}
				onClose={() => setIsResetDialogOpen(false)}
				download={handleDownload}
				title={content["results.resetDialog.title"]}
				description={content["results.resetDialog.description"]}
				downloadLabel={content["results.resetDialog.download.label"]}
			/>
		</>
	);
}
