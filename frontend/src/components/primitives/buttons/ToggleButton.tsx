export interface ToggleButtonProps {
	checked: boolean;
	onChange: (next: boolean) => void;
}

export function ToggleButton({ checked, onChange }: ToggleButtonProps) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			onClick={() => onChange(!checked)}
			className={`relative h-7 w-16 py-2 px-[3px] shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
				checked ? "bg-sky-300" : "bg-fill-secondary"
			}`}
		>
			<span
				className={`absolute left-[3px] top-[3px] h-[22px] w-8 rounded-full bg-white transition-transform ${
					checked ? "translate-x-[26px]" : "translate-x-0"
				}`}
			/>
		</button>
	);
}
