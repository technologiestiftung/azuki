import React from "react";
import { type ButtonProps } from "./buttonTypes";

export type PrimaryThemedButtonProps = ButtonProps;

export const PrimaryThemedButton: React.FC<PrimaryThemedButtonProps> = ({
	onClick,
	disabled = false,
	type = "button",
	ariaLabel,
	title,
	className = "",
	children,
}) => {
	return (
		<button
			className={`h-12 flex items-center justify-center gap-2 w-full py-2 px-5 rounded-2xl text-base font-medium transition-colors
				focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 active:bg-sky-200 active:text-sky-800 ${
					disabled
						? "bg-sky-shade-20 text-sky-shade-70"
						: "bg-sky-300 text-sky-900 md:hover:bg-sky-200 md:hover:text-sky-800"
				} ${className}`}
			disabled={disabled}
			onClick={onClick}
			type={type}
			aria-label={ariaLabel}
			title={title}
		>
			{children}
		</button>
	);
};
