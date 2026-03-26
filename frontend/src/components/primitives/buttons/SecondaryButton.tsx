import React from "react";
import { type ButtonProps } from "./buttonTypes";

export type SecondaryButtonProps = ButtonProps;

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
	onClick,
	disabled,
	type = "button",
	ariaLabel,
	title,
	className = "",
	children,
}) => {
	return (
		<button
			className={`h-12 w-full py-2 px-5 text-base font-medium transition-colors rounded-2xl bg-gray-300
				focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500
				hover:bg-gray-200 hover:text-gray-800
				${disabled ? "text-gray-400" : "text-gray-900 hover:text-gray-800"}
				${className}`}
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
