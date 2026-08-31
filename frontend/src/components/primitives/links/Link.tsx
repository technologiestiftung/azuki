import React from "react";

export interface LinkProps {
	href: string;
	label: string;
	target?: "_blank" | "_self" | "_parent" | "_top";
	rel?: "noopener noreferrer";
	variant?: "default" | "primary";
	showIcon?: boolean;
}

export const Link: React.FC<LinkProps> = ({
	href,
	label,
	variant = "default",
	target = "_blank",
	rel = "noopener noreferrer",
	showIcon = false,
}) => {
	return (
		<a
			href={href}
			target={target}
			rel={rel}
			className={`flex gap-1.5 text-base font-medium underline ${variant === "primary" ? "text-sky-400 md:hover:text-sky-600 active:text-sky-600 disabled:text-sky-shade-70" : "text-sky-700 md:hover:text-sky-800 active:text-sky-800 disabled:text-sky-shade-70"}`}
		>
			{label}
			{showIcon && (
				<img src="/icons/open-in-new-sky.svg" alt="" width={20} height={20} />
			)}
		</a>
	);
};
