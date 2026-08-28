import { strengths } from "../../competence-profile/steps/strengths-step/strengths";

interface Props {
	strengths: Record<string, number>;
	onChange: (next: Record<string, number>) => void;
}

const LEVELS: { value: number; label: string }[] = [
	{ value: 0, label: "nicht" },
	{ value: 0.5, label: "etwas" },
	{ value: 1, label: "stark" },
];

export function StrengthsEditor({ strengths: state, onChange }: Props) {
	function setLevel(id: string, value: number) {
		onChange({ ...state, [id]: value });
	}

	function remove(id: string) {
		const { [id]: _removed, ...next } = state;
		onChange(next);
	}

	return (
		<div className="flex flex-col gap-2">
			<span className="text-sm text-gray-600">Stärken</span>
			<ul className="flex flex-col gap-1">
				{strengths.map((s) => {
					const recorded = s.id in state;
					const current = state[s.id];
					return (
						<li key={s.id} className="flex items-center gap-2 text-xs py-1">
							<span className="flex-1">{s.title}</span>
							{recorded ? (
								<>
									<div className="flex gap-0.5">
										{LEVELS.map((lvl) => (
											<button
												key={lvl.value}
												type="button"
												onClick={() => setLevel(s.id, lvl.value)}
												className={`px-2 py-0.5 rounded border ${
													current === lvl.value
														? "bg-blue-100 border-blue-400 text-blue-800"
														: "bg-gray-50 border-sky-shade-30 text-gray-600"
												}`}
											>
												{lvl.label}
											</button>
										))}
									</div>
									<button
										type="button"
										onClick={() => remove(s.id)}
										className="text-red-600 underline text-[10px]"
										aria-label={`${s.title} aus Datensatz entfernen`}
									>
										×
									</button>
								</>
							) : (
								<>
									<span className="text-gray-400 italic">
										— nicht erfasst —
									</span>
									<button
										type="button"
										onClick={() => setLevel(s.id, 0)}
										className="text-blue-600 underline text-[10px]"
									>
										+ erfassen
									</button>
								</>
							)}
						</li>
					);
				})}
			</ul>
		</div>
	);
}
