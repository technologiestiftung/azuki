import React from "react";
import { type ButtonProps } from "./buttonTypes";

export type GhostButtonProps = ButtonProps;

export const GhostButton: React.FC<GhostButtonProps> = ({
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
			className={`h-12 w-full py-2 px-5 text-base font-medium transition-colors rounded-2xl 
				focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 
				md:hover:bg-gray-200 md:hover:text-gray-800
				${disabled ? "text-gray-400" : "text-gray-900 hover:text-gray-700"}
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
