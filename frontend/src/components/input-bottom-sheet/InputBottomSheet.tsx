import { useEffect, useRef, useState } from "react";
import {
	BottomSheet,
	type BottomSheetStackTier,
} from "../primitives/bottom-sheet/BottomSheet";
import { PrimaryThemedButton } from "../primitives/buttons/PrimaryThemedButton";
import { SecondaryButton } from "../primitives/buttons/SecondaryButton";
import { content } from "../../content";
import { TextInput } from "../primitives/text-inputs/TextInput";

const inputBottomSheetErrorId = "input-bottom-sheet-error";

export interface InputBottomSheetProps {
	open: boolean;
	onClose: () => void;
	sheetAriaLabel: string;
	inputPlaceholder: string;
	onSubmit: (value: string) => void;
	title?: string;
	submitButtonLabel?: string;
	isCancelButtonVisible?: boolean;
	stackTier?: BottomSheetStackTier;
	onShellHeightChange?: (height: number) => void;
}

export function InputBottomSheet({
	open,
	onClose,
	sheetAriaLabel,
	inputPlaceholder,
	onSubmit,
	title,
	submitButtonLabel,
	isCancelButtonVisible = true,
	stackTier = "default",
	onShellHeightChange,
}: InputBottomSheetProps) {
	const [value, setValue] = useState("");
	const [error, setError] = useState(false);
	const wasOpen = useRef(false);

	useEffect(() => {
		if (!open && wasOpen.current) {
			setValue("");
			setError(false);
		}
		wasOpen.current = open;
	}, [open]);

	const submit = () => {
		const trimmed = value.trim();
		if (!trimmed) {
			setError(true);
			return;
		}
		onSubmit(trimmed);
		setValue("");
		setError(false);
		onClose();
	};

	const handleClearInput = () => {
		setValue("");
		setError(false);
	};

	return (
		<BottomSheet
			open={open}
			onClose={onClose}
			ariaLabel={sheetAriaLabel}
			stackTier={stackTier}
			onShellHeightChange={onShellHeightChange}
		>
			<div className="flex flex-col items-center gap-3 pt-1 pb-4 px-4 w-full">
				{title && (
					<h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
				)}
				<div className="flex flex-col gap-2 w-full">
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
						onSubmit={submit}
						onClearInput={handleClearInput}
						submitDisabled={!value.trim()}
					/>

					{error && (
						<div
							id={inputBottomSheetErrorId}
							role="alert"
							className="flex gap-1 text-red-700 text-lg font-medium"
						>
							<img src="/icons/error.svg" alt="" className="w-6 h-6" />
							{content["common.bottomSheet.errorMessage"]}
						</div>
					)}
				</div>

				<div className="flex gap-3 w-full">
					{isCancelButtonVisible && (
						<SecondaryButton
							onClick={onClose}
							ariaLabel={content["common.bottomSheet.cancelButtonAriaLabel"]}
						>
							{content["common.bottomSheet.cancelButtonLabel"]}
						</SecondaryButton>
					)}
					<PrimaryThemedButton
						onClick={submit}
						ariaLabel={content["common.bottomSheet.submitButtonAriaLabel"]}
					>
						{submitButtonLabel ||
							content["common.bottomSheet.submitButtonLabel"]}
					</PrimaryThemedButton>
				</div>
			</div>
		</BottomSheet>
	);
}
