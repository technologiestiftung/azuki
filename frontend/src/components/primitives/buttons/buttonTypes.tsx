import React, { type CSSProperties, type ReactNode } from "react";

export interface ButtonProps {
	label?: string | React.ReactNode;
	onClick?: () => void;
	disabled?: boolean;
	type?: "button" | "submit";
	ariaLabel?: string;
	title?: string;
	isLoading?: boolean;
	className?: string;
	style?: CSSProperties;
	children?: string | ReactNode;
	testId?: string;
	icon?: ReactNode;
	iconSrc?: string;
	iconSize?: string;
}
