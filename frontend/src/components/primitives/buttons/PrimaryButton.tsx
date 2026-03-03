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
			className={`py-4 rounded-2xl text-lg leading-6 font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
				disabled ? "bg-gray-200 text-gray-400" : "bg-sky-300 text-sky-1000"
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
