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
			className={`h-12 w-full py-2 px-5 text-base font-medium transition-colors rounded-2xl bg-sky-shade-20
				focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500
				md:hover:bg-sky-shade-10 active:bg-sky-shade-10 active:text-sky-shade-160
				${disabled ? "text-sky-shade-70 bg-sky-shade-20" : "text-sky-900 md:hover:text-sky-shade-160"}
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
