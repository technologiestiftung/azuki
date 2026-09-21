import type { ReactNode } from "react";

interface SelectableCardButtonProps {
	label: string;
	selected: boolean;
	onClick: () => void;
	children?: ReactNode;
	className?: string;
	showIndicator?: boolean;
}

export function SelectableCardButton({
	label,
	selected,
	onClick,
	children,
	className,
	showIndicator = true,
}: SelectableCardButtonProps) {
	return (
		<button
			type="button"
			role="radio"
			aria-checked={selected}
			className={`flex flex-col justify-center items-start text-left gap-2 min-h-[52px] p-3 w-full rounded-xl border-2 text-lg font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
				selected
					? "border-sky-300 bg-sky-50"
					: "border-sky-shade-20 bg-transparent"
			} ${className}`}
			onClick={onClick}
		>
			<span className="flex items-center justify-between w-full gap-2">
				{label}
				{showIndicator && (
					<span
						className={`flex items-center justify-center shrink-0 w-[22px] h-[22px] rounded-full ${
							selected
								? "border-sky-300 border-[6px]"
								: "border-sky-shade-20 border-2"
						}`}
					>
						{selected && (
							<span className="w-2.5 h-2.5 rounded-full bg-sky-white" />
						)}
					</span>
				)}
			</span>
			{children}
		</button>
	);
}
