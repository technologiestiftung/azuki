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

export type SkipConfirmTitleContentKey =
	| "skipConfirmDialog.default.title"
	| "skipConfirmDialog.singleChoice.title"
	| "skipConfirmDialog.multipleChoice.title"
	| "skipConfirmDialog.skipAll.title"
	| "skipConfirmDialog.textInput.title";

export type SkipConfirmDescriptionContentKey =
	| "skipConfirmDialog.default.description"
	| "skipConfirmDialog.singleChoice.description"
	| "skipConfirmDialog.multipleChoice.description"
	| "skipConfirmDialog.skipAll.description"
	| "skipConfirmDialog.textInput.description";

interface SkipConfirmDialogProps {
	onSkip?: () => void;
	onStay?: () => void;
	titleKey?: SkipConfirmTitleContentKey;
	descriptionKey?: SkipConfirmDescriptionContentKey;
}

export const SkipConfirmDialog: React.FC<SkipConfirmDialogProps> = ({
	onSkip,
	onStay,
	titleKey = "skipConfirmDialog.default.title",
	descriptionKey = "skipConfirmDialog.default.description",
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

	let stayButtonLabel = content["skipConfirmDialog.confirm.selection"];
	if (titleKey === "skipConfirmDialog.skipAll.title") {
		stayButtonLabel = content["skipConfirmDialog.confirm.answerMultiple"];
	} else if (titleKey === "skipConfirmDialog.textInput.title") {
		stayButtonLabel = content["skipConfirmDialog.confirm.answerSingle"];
	}

	return (
		<DefaultDialog id={skipConfirmDialogId} className="max-w-[398px]">
			<div className="flex flex-col gap-2 px-2 pb-6 text-gray-900">
				<h2 className="text-lg font-semibold pb-1">{content[titleKey]}</h2>
				<p className="text-lg">{content[descriptionKey]}</p>
			</div>
			<div className="flex flex-col gap-2 pt-2">
				<PrimaryThemedButton onClick={handleStay}>
					{stayButtonLabel}
				</PrimaryThemedButton>
				<SecondaryButton onClick={handleSkip}>
					{content["skipConfirmDialog.cancel"]}
				</SecondaryButton>
			</div>
		</DefaultDialog>
	);
};
