import React from "react";
import { type ButtonProps } from "./buttonTypes";

export type GhostIconButtonProps = ButtonProps;

export const GhostIconButton: React.FC<GhostIconButtonProps> = ({
	onClick,
	disabled,
	type = "button",
	ariaLabel,
	title,
	className = "",
	style,
	children,
	iconSrc,
	iconSize = "",
	tabIndex,
}) => {
	return (
		<button
			className={`inline-flex h-10 w-10 items-center justify-center p-2 text-base font-medium transition-colors rounded-2xl 
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 
				md:hover:bg-sky-shade-20 md:hover:text-sky-800 active:bg-sky-shade-20 active:text-sky-800
				${disabled ? "text-sky-shade-70" : "text-sky-900 hover:text-sky-800"}
				${className}`}
			style={style}
			disabled={disabled}
			onClick={onClick}
			type={type}
			aria-label={ariaLabel}
			title={title}
			tabIndex={tabIndex}
		>
			{iconSrc && (
				<img src={iconSrc} alt="" className={`${iconSize ?? "w-6 h-6"}`} />
			)}
			{children}
		</button>
	);
};
