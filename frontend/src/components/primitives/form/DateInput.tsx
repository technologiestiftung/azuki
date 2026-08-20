import type { InputHTMLAttributes } from "react";

const calendarPickerClassName =
	"[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:h-4 [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:bg-[url('/icons/calendar-sky.svg')] [&::-webkit-calendar-picker-indicator]:bg-center [&::-webkit-calendar-picker-indicator]:bg-no-repeat [&::-webkit-calendar-picker-indicator]:bg-[length:16px_16px]";

export type DateInputProps = Omit<
	InputHTMLAttributes<HTMLInputElement>,
	"type"
> & {
	error?: boolean;
};

export function DateInput({
	error = false,
	className = "",
	...props
}: DateInputProps) {
	return (
		<input
			type="date"
			className={`block w-full min-w-0 max-w-full appearance-none bg-white h-12 px-3 py-2 text-base rounded-lg border-2 ${
				error ? "border-red-600" : "border-gray-400"
			} focus:outline-none focus:ring-2 focus:ring-sky-300 ${calendarPickerClassName} ${className}`}
			aria-invalid={error}
			{...props}
		/>
	);
}
