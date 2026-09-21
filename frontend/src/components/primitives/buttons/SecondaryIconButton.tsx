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
	style,
	children,
	iconSrc,
}) => {
	return (
		<button
			className={`inline-flex h-10 w-10 items-center justify-center p-2 text-base font-medium transition-colors rounded-2xl bg-sky-shade-20
				focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500
				md:hover:bg-sky-shade-10 md:hover:text-sky-shade-160 active:bg-sky-shade-10 active:text-sky-shade-160
				${disabled ? "text-sky-shade-70" : "text-sky-900 md:hover:text-sky-shade-160"}
				${className}`}
			style={style}
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
