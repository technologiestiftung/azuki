import React, { InputHTMLAttributes } from "react";

interface TextInputProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, "onSubmit"> {
	onSubmit?: () => void;
	onClearInput?: () => void;
	submitDisabled?: boolean;
	containerClassName?: string;
	error?: boolean;
	errorMessage?: string;
}

export const TextInput = ({
	onSubmit,
	onClearInput,
	submitDisabled = true,
	containerClassName = "",
	className = "",
	onKeyDown,
	error = false,
	errorMessage,
	...inputProps
}: TextInputProps) => {
	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter" && onSubmit) {
			e.preventDefault();
			onSubmit();
			return;
		}
		onKeyDown?.(e);
	}

	return (
		<div className="flex flex-col gap-1">
			<div
				className={`h-[60px] flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 focus-within:outline focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-sky-300 bg-white group transition-colors ${error ? "border-red-700 focus-within:outline-red-700" : "border-gray-500 focus-within:border-gray-700"} ${containerClassName}`}
			>
				<input
					type="text"
					onKeyDown={handleKeyDown}
					className={`flex-1 placeholder:text-gray-400 text-sky-900 text-lg font-medium bg-white focus:outline-none ${className}`}
					{...inputProps}
					aria-invalid={error}
					aria-describedby={error ? "input-error" : undefined}
				/>

				{inputProps.value && (
					<button
						type="button"
						onClick={onClearInput}
						disabled={submitDisabled}
						className="bg-gray-300 rounded-full p-2 size-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
					>
						<img src="/icons/close-black.svg" alt="" className="w-4 h-4" />
					</button>
				)}
			</div>
			{error && errorMessage && (
				<p id="input-error" className="text-sm text-red-600 mt-1">
					{errorMessage}
				</p>
			)}
		</div>
	);
};
