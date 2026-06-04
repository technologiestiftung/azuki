import { useState } from "react";

interface Props {
	customNoGos: string[];
	noGos: Record<string, "rejected" | "accepted" | null>;
	onChange: (next: {
		customNoGos: string[];
		noGos: Record<string, "rejected" | "accepted" | null>;
	}) => void;
}

export function CustomNoGosEditor({ customNoGos, noGos, onChange }: Props) {
	const [draft, setDraft] = useState("");

	function addCustom() {
		const trimmed = draft.trim();
		if (!trimmed || customNoGos.includes(trimmed)) {
			return;
		}
		onChange({
			customNoGos: [...customNoGos, trimmed],
			noGos: { ...noGos, [trimmed]: "rejected" },
		});
		setDraft("");
	}

	function removeCustom(value: string) {
		const nextNoGos = Object.fromEntries(
			Object.entries(noGos).filter(([key]) => key !== value),
		);
		onChange({
			customNoGos: customNoGos.filter((v) => v !== value),
			noGos: nextNoGos,
		});
	}

	function toggleRejected(value: string) {
		const current = noGos[value];
		onChange({
			customNoGos,
			noGos: {
				...noGos,
				[value]: current === "rejected" ? "accepted" : "rejected",
			},
		});
	}

	return (
		<div className="flex flex-col gap-1">
			<span className="text-xs text-gray-500">Eigene No-Gos</span>
			{customNoGos.length > 0 && (
				<div className="flex flex-wrap gap-1">
					{customNoGos.map((value) => (
						<span
							key={value}
							className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border ${
								noGos[value] === "rejected"
									? "bg-orange-50 border-orange-200 text-orange-800"
									: "bg-gray-50 border-gray-200 text-gray-600"
							}`}
						>
							<button
								type="button"
								onClick={() => toggleRejected(value)}
								className="text-left"
							>
								{value}
							</button>
							<button
								type="button"
								onClick={() => removeCustom(value)}
								className="hover:opacity-70"
								aria-label={`${value} entfernen`}
							>
								×
							</button>
						</span>
					))}
				</div>
			)}
			<div className="flex gap-1">
				<input
					type="text"
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							addCustom();
						}
					}}
					placeholder="z. B. lange Pendeln"
					className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs"
				/>
				<button
					type="button"
					onClick={addCustom}
					disabled={!draft.trim()}
					className="text-xs border border-gray-400 rounded px-2 py-1 disabled:opacity-50"
				>
					Hinzufügen
				</button>
			</div>
		</div>
	);
}
