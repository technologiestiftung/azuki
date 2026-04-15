import React from "react";
import { type ButtonProps } from "./buttonTypes";

export type PrimaryButtonProps = ButtonProps;

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
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
				focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 active:bg-gray-700 active:text-gray-50 ${
					disabled
						? "bg-gray-200 text-gray-400"
						: "bg-gray-900 text-white md:hover:bg-gray-700 md:hover:text-gray-50"
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
