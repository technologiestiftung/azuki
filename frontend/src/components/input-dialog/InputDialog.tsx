import React, { useState } from "react";
import { DefaultDialog } from "../primitives/dialogs/DefaultDialog";
import { PrimaryThemedButton } from "../primitives/buttons/PrimaryThemedButton";
import { SecondaryButton } from "../primitives/buttons/SecondaryButton";
import { content } from "../../content/de";

const inputDialogId = "input-dialog";

export function showInputDialog() {
	(
		document.getElementById(`${inputDialogId}`) as HTMLDialogElement
	).showModal();
}

export function hideInputDialog() {
	(document.getElementById(`${inputDialogId}`) as HTMLDialogElement).close();
}

interface InputDialogProps {
	inputPlaceholder: string;
	onSubmit: (value: string) => void;
}

export const InputDialog = ({
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

	return (
		<DefaultDialog
			id={inputDialogId}
			afterClose={() => {
				setValue("");
				setError(false);
			}}
			className="w-full"
		>
			<div className="flex flex-col gap-10 p-4 rounded-4xl bg-gray-100">
				<div className="flex flex-col gap-2">
					<div
						className={`h-[60px] flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-gray-500 focus-within:outline focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-sky-300 focus-within:border-gray-800 bg-white group transition-colors ${error && "border-red-700 focus-within:outline-red-700"}`}
					>
						<input
							type="text"
							placeholder={inputPlaceholder}
							value={value}
							onChange={(e) => {
								setValue(e.target.value);
								if (error) {
									setError(false);
								}
							}}
							onKeyDown={handleKeyDown}
							className="flex-1 placeholder:text-gray-400 text-sky-900 text-lg font-medium bg-white focus:outline-none"
						/>
						{value && (
							<button
								type="button"
								onClick={() => {
									setValue("");
									setError(false);
								}}
								aria-label={content["common.inputDialog.clearButtonAriaLabel"]}
								className="bg-gray-300 rounded-full p-2 size-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
							>
								<img src="/icons/close-black.svg" alt="" className="w-4 h-4" />
							</button>
						)}
					</div>
					{error && (
						<div className="flex gap-1 text-red-700 text-lg font-medium">
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
