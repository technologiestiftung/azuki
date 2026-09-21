import { workExpectationOptions } from "../../competence-profile/steps/work-expectation-options";

interface Props {
	workExpectations: string[];
	onChange: (next: string[]) => void;
}

export function WorkExpectationsEditor({
	workExpectations: selected,
	onChange,
}: Props) {
	function toggle(value: string) {
		const next = selected.includes(value)
			? selected.filter((v) => v !== value)
			: [...selected, value];
		onChange(next);
	}

	return (
		<div className="flex flex-col gap-2">
			<span className="text-sm text-sky-shade-160">Rahmenbedingungen</span>
			<div className="flex flex-wrap gap-1">
				{workExpectationOptions.map((opt) => {
					const isSelected = selected.includes(opt.value);
					return (
						<button
							key={opt.value}
							type="button"
							onClick={() => toggle(opt.value)}
							className={`text-xs px-2 py-1 rounded border ${
								isSelected
									? "bg-blue-100 border-blue-400 text-blue-800"
									: "bg-sky-shade-10 border-sky-shade-30 text-sky-shade-160"
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
