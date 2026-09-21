interface SelectableRowButtonProps {
	label: string;
	selected: boolean;
	onClick: () => void;
	ariaLabel?: string;
}

export function SelectableRowButton({
	label,
	selected,
	onClick,
	ariaLabel,
}: SelectableRowButtonProps) {
	return (
		<button
			onClick={onClick}
			aria-label={ariaLabel || label}
			aria-pressed={selected}
			className={`min-h-[52px] w-full flex gap-2 items-center justify-between p-3 rounded-xl border-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
				selected
					? "border-sky-300 bg-sky-50"
					: "border-sky-shade-20 bg-transparent"
			}`}
		>
			<span className="text-left text-lg font-medium text-sky-shade-170">
				{label}
			</span>
			<div
				className={`w-6 h-6 rounded-[5px] border-2 flex items-center justify-center transition-colors ${
					selected
						? "border-sky-300 bg-sky-300"
						: "border-sky-shade-20 bg-transparent"
				}`}
			>
				{selected && (
					<img src="/icons/check-white.svg" alt="" width={18} height={18} />
				)}
			</div>
		</button>
	);
}
