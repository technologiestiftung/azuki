import React, { type ReactNode } from "react";

export interface ButtonProps {
	label?: string | React.ReactNode;
	onClick?: () => void;
	disabled?: boolean;
	type?: "button" | "submit";
	ariaLabel?: string;
	title?: string;
	isLoading?: boolean;
	className?: string;
	children?: string | ReactNode;
	testId?: string;
	icon?: ReactNode;
}
