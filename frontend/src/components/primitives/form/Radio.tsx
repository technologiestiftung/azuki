import type { InputHTMLAttributes } from "react";

const radioClassName =
	"size-[22px] border-2 border-sky-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-300 bg-white checked:bg-white checked:border-[6px] checked:border-sky-300 appearance-none";

const labelClassName =
	"text-base font-normal leading-[140%] text-gray-700 cursor-pointer";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function Radio({ className = "", ...props }: RadioProps) {
	return (
		<input
			type="radio"
			className={`${radioClassName} ${className}`}
			{...props}
		/>
	);
}

export type RadioOptionProps = RadioProps & {
	label: string;
	id: string;
};

export function RadioOption({
	label,
	id,
	className = "",
	...props
}: RadioOptionProps) {
	return (
		<div
			className={`flex justify-start items-center gap-2 min-h-8 ${className}`}
		>
			<Radio id={id} {...props} />
			<label htmlFor={id} className={labelClassName}>
				{label}
			</label>
		</div>
	);
}
