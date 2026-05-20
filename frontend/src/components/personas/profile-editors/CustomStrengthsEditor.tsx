import { useState } from "react";

interface Props {
	customStrengths: string[];
	onChange: (next: string[]) => void;
}

export function CustomStrengthsEditor({ customStrengths, onChange }: Props) {
	const [draft, setDraft] = useState("");

	function addCustom() {
		const trimmed = draft.trim();
		if (!trimmed || customStrengths.includes(trimmed)) {
			return;
		}
		onChange([...customStrengths, trimmed]);
		setDraft("");
	}

	function removeCustom(value: string) {
		onChange(customStrengths.filter((v) => v !== value));
	}

	return (
		<div className="flex flex-col gap-1">
			<span className="text-xs text-gray-500">Eigene Stärken</span>
			{customStrengths.length > 0 && (
				<div className="flex flex-wrap gap-1">
					{customStrengths.map((value) => (
						<span
							key={value}
							className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-50 border border-purple-200 text-purple-800"
						>
							{value}
							<button
								type="button"
								onClick={() => removeCustom(value)}
								className="text-purple-600 hover:text-purple-900"
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
					placeholder="z. B. gut zuhören"
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
