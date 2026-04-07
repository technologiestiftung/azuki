import React from "react";
import { content } from "../../content/de";
import { DefaultDialog } from "../primitives/dialogs/DefaultDialog";
import { PrimaryThemedButton } from "../primitives/buttons/PrimaryThemedButton";
import { SecondaryButton } from "../primitives/buttons/SecondaryButton";

const skipConfirmDialogId = "skip-confirm-dialog";

export function showSkipConfirmDialog() {
	(
		document.getElementById(`${skipConfirmDialogId}`) as HTMLDialogElement
	).showModal();
}

export function hideSkipConfirmDialog() {
	(
		document.getElementById(`${skipConfirmDialogId}`) as HTMLDialogElement
	).close();
}

interface SkipConfirmDialogProps {
	onSkip?: () => void;
	onStay?: () => void;
}

export const SkipConfirmDialog: React.FC<SkipConfirmDialogProps> = ({
	onSkip,
	onStay,
}) => {
	const handleStay = () => {
		hideSkipConfirmDialog();
		if (onStay) {
			onStay();
		}
	};

	const handleSkip = () => {
		hideSkipConfirmDialog();
		if (onSkip) {
			onSkip();
		}
	};

	return (
		<DefaultDialog id={skipConfirmDialogId}>
			<div className="flex flex-col gap-2 px-2 pb-6 text-gray-900">
				<h2 className="text-lg font-semibold pb-1">
					{content["skipConfirmDialog.title"]}
				</h2>
				<p className="text-lg">{content["skipConfirmDialog.description"]}</p>
			</div>
			<div className="flex flex-col gap-2 pt-2">
				<PrimaryThemedButton onClick={handleStay}>
					{content["skipConfirmDialog.confirm"]}
				</PrimaryThemedButton>
				<SecondaryButton onClick={handleSkip}>
					{content["skipConfirmDialog.cancel"]}
				</SecondaryButton>
			</div>
		</DefaultDialog>
	);
};
