import type { InputHTMLAttributes } from "react";

export type FormTextInputProps = InputHTMLAttributes<HTMLInputElement> & {
	error?: boolean;
};

export function FormTextInput({
	error = false,
	className = "",
	type = "text",
	...props
}: FormTextInputProps) {
	return (
		<input
			type={type}
			className={`w-full placeholder:text-gray-400 placeholder:text-base h-12 px-3 py-2 rounded-lg border-2 ${
				error ? "border-red-600" : "border-gray-400"
			} focus:outline-none focus:ring-2 focus:ring-sky-300 ${className}`}
			aria-invalid={error}
			{...props}
		/>
	);
}
