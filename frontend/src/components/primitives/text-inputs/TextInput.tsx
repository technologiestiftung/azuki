import React, { InputHTMLAttributes } from "react";

interface TextInputProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, "onSubmit"> {
	onSubmit?: () => void;
	submitDisabled?: boolean;
	containerClassName?: string;
}

export const TextInput = ({
	onSubmit,
	submitDisabled = true,
	containerClassName = "",
	className = "",
	onKeyDown,
	...inputProps
}: TextInputProps) => {
	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter" && onSubmit) {
			onSubmit();
		}
		onKeyDown?.(e);
	}

	return (
		<div
			className={`flex items-center gap-2 rounded-2xl border-2 border-gray-600 focus-within:outline focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-sky-300 focus-within:border-gray-800 pr-2 pl-4 py-2 bg-white group transition-colors ${containerClassName}`}
		>
			<input
				type="text"
				onKeyDown={handleKeyDown}
				className={`flex-1 text-gray-500 text-lg font-medium bg-white focus:outline-none rounded-2xl py-2 ${className}`}
				{...inputProps}
			/>
			{onSubmit && (
				<button
					onClick={onSubmit}
					disabled={submitDisabled}
					className={`w-10 h-10 flex items-center justify-center transition-colors rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 shrink-0 ${
						!submitDisabled ? "bg-sky-300" : "bg-gray-300"
					}`}
				>
					<img src="/icons/arrow-up-white.svg" alt="" className="w-6 h-6" />
				</button>
			)}
		</div>
	);
};
