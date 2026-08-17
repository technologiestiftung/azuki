import type { InputHTMLAttributes } from "react";

export type CheckboxProps = Omit<
	InputHTMLAttributes<HTMLInputElement>,
	"type"
> & {
	error?: boolean;
};

export function Checkbox({
	error = false,
	className = "",
	...props
}: CheckboxProps) {
	return (
		<input
			type="checkbox"
			className={`size-[22px] mt-0.5 shrink-0 border-2 ${
				error ? "border-red-400" : "border-sky-200"
			} rounded-[5px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-300 bg-white checked:bg-sky-300 checked:border-sky-300 checked:bg-[url('/icons/check-white.svg')] checked:bg-center checked:bg-no-repeat appearance-none ${className}`}
			aria-invalid={error}
			{...props}
		/>
	);
}
