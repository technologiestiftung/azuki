import { workPreferencePairs } from "../../../content/work-preference-pairs";

interface Props {
	workPreferences: Record<string, "a" | "b" | null>;
	onChange: (next: Record<string, "a" | "b" | null>) => void;
}

export function WorkPreferencesEditor({
	workPreferences: state,
	onChange,
}: Props) {
	function set(id: string, value: "a" | "b" | null) {
		onChange({ ...state, [id]: value });
	}

	function buttonClass(active: boolean) {
		return `px-2 py-0.5 rounded border ${
			active
				? "bg-blue-100 border-blue-400 text-blue-800"
				: "bg-gray-50 border-sky-shade-30 text-gray-600"
		}`;
	}

	return (
		<div className="flex flex-col gap-2">
			<span className="text-sm text-gray-600">Arbeitsvorlieben</span>
			<ul className="flex flex-col gap-1">
				{workPreferencePairs.map((pair) => {
					const value = state[pair.id] ?? null;
					return (
						<li key={pair.id} className="flex items-center gap-2 text-xs py-1">
							<span className="flex-1 text-gray-700">
								{pair.a} / {pair.b}
							</span>
							<div className="flex gap-0.5">
								<button
									type="button"
									onClick={() => set(pair.id, "a")}
									className={buttonClass(value === "a")}
								>
									{pair.a}
								</button>
								<button
									type="button"
									onClick={() => set(pair.id, "b")}
									className={buttonClass(value === "b")}
								>
									{pair.b}
								</button>
								<button
									type="button"
									onClick={() => set(pair.id, null)}
									className={buttonClass(value === null)}
								>
									—
								</button>
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
