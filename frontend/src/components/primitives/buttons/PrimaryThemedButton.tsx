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
			className={`h-12 w-full py-2 px-5 rounded-2xl text-base font-medium transition-colors
				focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
					disabled
						? "bg-gray-200 text-gray-400"
						: "bg-sky-300 text-sky-1000 md:hover:bg-sky-200"
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
