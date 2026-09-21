import React from "react";
import { type ButtonProps } from "./buttonTypes";

export type ThemedIconButtonProps = ButtonProps;

export const ThemedIconButton: React.FC<ThemedIconButtonProps> = ({
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
			className={`inline-flex h-10 w-10 items-center justify-center p-2 text-base font-medium rounded-2xl
				focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
					disabled
						? "bg-sky-shade-20 text-sky-shade-70 pointer-events-none"
						: "bg-sky-300 text-sky-900 md:hover:bg-sky-200 md:hover:text-sky-800 active:bg-sky-200 active:text-sky-800"
				} ${className}`}
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
