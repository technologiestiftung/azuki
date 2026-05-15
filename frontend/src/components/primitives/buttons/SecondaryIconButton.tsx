import React from "react";
import { type ButtonProps } from "./buttonTypes";

export type SecondaryButtonProps = ButtonProps;

export const SecondaryIconButton: React.FC<SecondaryButtonProps> = ({
	onClick,
	disabled,
	type = "button",
	ariaLabel,
	title,
	className = "",
	children,
	iconSrc,
}) => {
	return (
		<button
			className={`inline-flex h-10 w-10 items-center justify-center p-2 text-base font-medium transition-colors rounded-2xl bg-gray-300
				focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500
				md:hover:bg-gray-200 md:hover:text-gray-800 active:bg-gray-200 active:text-gray-800
				${disabled ? "text-gray-400" : "text-gray-900 md:hover:text-gray-800"}
				${className}`}
			disabled={disabled}
			onClick={onClick}
			type={type}
			aria-label={ariaLabel}
			title={title}
		>
			{iconSrc && <img src={iconSrc} alt="" className="w-5 h-5" />}
			{children}
		</button>
	);
};
