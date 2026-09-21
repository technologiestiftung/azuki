import type { ReactNode } from "react";

interface SelectableCardButtonProps {
	label: string;
	selected: boolean;
	onClick: () => void;
	children?: ReactNode;
	className?: string;
}

export function SelectableCardButton({
	label,
	selected,
	onClick,
	children,
	className,
}: SelectableCardButtonProps) {
	return (
		<button
			className={`flex flex-col justify-center items-start text-left gap-2 min-h-[52px] p-3 w-full rounded-xl border-2 text-lg font-medium text-sky-shade-170 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
				selected
					? "border-sky-300 bg-sky-50"
					: "border-sky-shade-20 bg-transparent"
			} ${className}`}
			onClick={onClick}
		>
			{label}
			{children}
		</button>
	);
}
