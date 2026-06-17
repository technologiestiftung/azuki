import { type ReactNode } from "react";

export interface FilterChipButtonProps {
	active?: boolean;
	onClick: () => void;
	ariaLabel: string;
	title?: string;
	ariaPressed?: boolean;
	variant?: "default" | "dropdown";
	className?: string;
	children: ReactNode;
}

export function FilterChipButton({
	active = false,
	onClick,
	ariaLabel,
	title,
	ariaPressed,
	variant = "default",
	className = "",
	children,
}: FilterChipButtonProps) {
	return (
		<button
			type="button"
			className={`h-8 flex items-center justify-center gap-1.5 py-[5px] text-gray-1000 border-2 rounded-full 
				focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${variant === "dropdown" ? "pl-3 pr-2" : "px-3"} ${
					active ? "border-sky-300 bg-sky-50" : "border-gray-300"
				} ${className}`}
			onClick={onClick}
			aria-label={ariaLabel}
			title={title}
			aria-pressed={ariaPressed}
		>
			{children}
			{variant === "dropdown" && (
				<img
					src="/icons/chevron-down.svg"
					alt=""
					className="h-4 w-4 shrink-0"
				/>
			)}
		</button>
	);
}
