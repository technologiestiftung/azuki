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
				md:hover:bg-sky-shade-20 md:hover:text-sky-800 active:bg-sky-shade-20 active:text-sky-800
				${disabled ? "text-sky-shade-70" : "text-sky-900 hover:text-sky-800"}
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
