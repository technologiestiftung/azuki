import { workValues } from "../../competence-profile/steps/work-values";

interface Props {
	workValues: string[];
	onChange: (next: string[]) => void;
}

export function WorkValuesEditor({ workValues: selected, onChange }: Props) {
	function toggle(value: string) {
		const next = selected.includes(value)
			? selected.filter((v) => v !== value)
			: [...selected, value];
		onChange(next);
	}

	return (
		<div className="flex flex-col gap-2">
			<span className="text-sm text-gray-600">Rahmenbedingungen</span>
			<div className="flex flex-wrap gap-1">
				{workValues.map((opt) => {
					const isSelected = selected.includes(opt.value);
					return (
						<button
							key={opt.value}
							type="button"
							onClick={() => toggle(opt.value)}
							className={`text-xs px-2 py-1 rounded border ${
								isSelected
									? "bg-blue-100 border-blue-400 text-blue-800"
									: "bg-gray-50 border-gray-300 text-gray-600"
							}`}
						>
							{opt.label}
						</button>
					);
				})}
			</div>
		</div>
	);
}
