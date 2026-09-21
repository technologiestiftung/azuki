import React from "react";
interface PillProps {
	label?: string;
	icon?: string;
	selected?: boolean;
	onClick: () => void;
	ariaLabel?: string;
	className?: string;
	children?: React.ReactNode;
	removeButton?: boolean;
}

export function Pill({
	label,
	icon,
	selected,
	onClick,
	ariaLabel,
	className,
	children,
	removeButton = false,
}: PillProps) {
	return (
		<button
			onClick={onClick}
			aria-label={ariaLabel || label}
			aria-pressed={selected ?? false}
			className={`h-12 flex min-w-0 max-w-full items-center gap-1.5 p-3 rounded-xl border-2 text-lg text-sky-shade-160 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
				selected
					? "border-sky-300 bg-sky-50"
					: "border-sky-shade-30 bg-sky-white"
			} ${className}`}
		>
			{icon && <span className="shrink-0">{icon}</span>}
			{label && <span className="w-full truncate">{label}</span>}
			{children}
			{removeButton && (
				<span className="shrink-0">
					<img src="/icons/close-gray.svg" alt="" className="w-6 h-6" />
				</span>
			)}
		</button>
	);
}
