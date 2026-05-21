import React, { useState } from "react";
import { DefaultDialog } from "../primitives/dialogs/DefaultDialog";
import { PrimaryThemedButton } from "../primitives/buttons/PrimaryThemedButton";
import { SecondaryButton } from "../primitives/buttons/SecondaryButton";
import { content } from "../../content";
import { TextInput } from "../primitives/text-inputs/TextInput";

const inputDialogId = "input-dialog";
const inputDialogErrorId = "input-dialog-error";

export function showInputDialog() {
	(
		document.getElementById(`${inputDialogId}`) as HTMLDialogElement
	).showModal();
}

export function hideInputDialog() {
	(document.getElementById(`${inputDialogId}`) as HTMLDialogElement).close();
}

interface InputDialogProps {
	dialogAriaLabel: string;
	inputPlaceholder: string;
	onSubmit: (value: string) => void;
}

export const InputDialog = ({
	dialogAriaLabel,
	inputPlaceholder,
	onSubmit,
}: InputDialogProps) => {
	const [value, setValue] = useState("");
	const [error, setError] = useState(false);

	const submit = () => {
		const trimmed = value.trim();
		if (!trimmed) {
			setError(true);
			return;
		}
		onSubmit(trimmed);
		setValue("");
		hideInputDialog();
	};

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter" && submit) {
			submit();
		}
	}

	const handleClearInput = () => {
		setValue("");
		setError(false);
	};

	return (
		<DefaultDialog
			id={inputDialogId}
			aria-label={dialogAriaLabel}
			afterClose={() => {
				setValue("");
				setError(false);
			}}
			className="w-full max-w-[398px]"
		>
			<div className="flex flex-col gap-10 p-4 rounded-4xl bg-gray-100">
				<div className="flex flex-col gap-2">
					<TextInput
						placeholder={inputPlaceholder}
						value={value}
						onChange={(e) => {
							setValue(e.target.value);
							if (error) {
								setError(false);
							}
						}}
						error={error}
						onKeyDown={handleKeyDown}
						onSubmit={submit}
						onClearInput={handleClearInput}
						submitDisabled={!value.trim()}
					/>

					{error && (
						<div
							id={inputDialogErrorId}
							role="alert"
							className="flex gap-1 text-red-700 text-lg font-medium"
						>
							<img src="/icons/error.svg" alt="" className="w-6 h-6" />
							{content["common.inputDialog.errorMessage"]}
						</div>
					)}
				</div>

				<div className="flex flex-col gap-2">
					<PrimaryThemedButton
						onClick={submit}
						ariaLabel={content["common.inputDialog.submitButtonAriaLabel"]}
					>
						{content["common.inputDialog.submitButtonLabel"]}
					</PrimaryThemedButton>
					<SecondaryButton
						onClick={hideInputDialog}
						ariaLabel={content["common.inputDialog.cancelButtonAriaLabel"]}
					>
						{content["common.inputDialog.cancelButtonLabel"]}
					</SecondaryButton>
				</div>
			</div>
		</DefaultDialog>
	);
};
