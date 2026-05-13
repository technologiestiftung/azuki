import React from "react";
import { type ButtonProps } from "./buttonTypes";

export type PrimaryOrangeButtonProps = ButtonProps;

export const PrimaryOrangeButton: React.FC<PrimaryOrangeButtonProps> = ({
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
				focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 active:bg-orange-600 active:text-orange-950 ${
					disabled
						? "bg-gray-200 text-gray-400"
						: "bg-orange-500 text-orange-1000 md:hover:bg-orange-400 md:hover:text-orange-950"
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
