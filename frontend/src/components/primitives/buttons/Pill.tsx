interface PillProps {
	label: string;
	icon?: string;
	selected: boolean;
	onClick: () => void;
	ariaLabel?: string;
}

export function Pill({ label, icon, selected, onClick, ariaLabel }: PillProps) {
	return (
		<button
			onClick={onClick}
			aria-label={ariaLabel || label}
			aria-pressed={selected}
			className={`flex items-center gap-1.5 p-3 rounded-xl border-2 text-lg text-gray-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
				selected ? "border-sky-300 bg-sky-50" : "border-gray-300 bg-sky-white"
			}`}
		>
			{icon && <span>{icon}</span>}
			<span>{label}</span>
		</button>
	);
}
