import { noGos } from "../../competence-profile/steps/no-gos-step/no-gos";

interface Props {
	noGos: Record<string, "rejected" | "accepted" | null>;
	onChange: (next: Record<string, "rejected" | "accepted" | null>) => void;
}

export function NoGosEditor({ noGos: state, onChange }: Props) {
	function set(id: string, value: "rejected" | "accepted" | null) {
		onChange({ ...state, [id]: value });
	}

	function buttonClass(active: boolean) {
		return `px-2 py-0.5 rounded border ${
			active
				? "bg-blue-100 border-blue-400 text-blue-800"
				: "bg-gray-50 border-gray-300 text-gray-600"
		}`;
	}

	return (
		<div className="flex flex-col gap-2">
			<span className="text-sm text-gray-600">No-Gos</span>
			<ul className="flex flex-col gap-1">
				{noGos.map((item) => {
					const value = state[item.id] ?? null;
					return (
						<li key={item.id} className="flex items-center gap-2 text-xs py-1">
							<span className="flex-1 text-gray-700">{item.title}</span>
							<div className="flex gap-0.5">
								<button
									type="button"
									onClick={() => set(item.id, "rejected")}
									className={buttonClass(value === "rejected")}
								>
									ablehnen
								</button>
								<button
									type="button"
									onClick={() => set(item.id, "accepted")}
									className={buttonClass(value === "accepted")}
								>
									akzeptieren
								</button>
								<button
									type="button"
									onClick={() => set(item.id, null)}
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
