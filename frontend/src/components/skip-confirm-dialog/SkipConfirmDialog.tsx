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
	onCancel?: () => void;
}

export const SkipConfirmDialog: React.FC<SkipConfirmDialogProps> = ({
	onCancel,
}) => {
	return (
		<DefaultDialog id={skipConfirmDialogId}>
			<div className="flex flex-col gap-2 px-2 pb-6 text-gray-900">
				<h2 className="text-lg font-semibold pb-1">
					{content["skipConfirmDialog.title"]}
				</h2>
				<p className="text-lg">{content["skipConfirmDialog.description"]}</p>
			</div>
			<div className="flex flex-col gap-2 pt-2">
				<PrimaryThemedButton onClick={hideSkipConfirmDialog}>
					{content["skipConfirmDialog.confirm"]}
				</PrimaryThemedButton>
				<SecondaryButton onClick={onCancel}>
					{content["skipConfirmDialog.cancel"]}
				</SecondaryButton>
			</div>
		</DefaultDialog>
	);
};
