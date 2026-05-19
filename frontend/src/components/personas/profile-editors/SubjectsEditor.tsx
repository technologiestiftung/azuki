import { useState } from "react";
import { SUBJECTS } from "@azuki/shared";
import { addCustomEntry, removeCustomEntry } from "./custom-entries";

interface Props {
	favoriteSubjects: string[];
	customSubjects: string[];
	onChange: (next: {
		favoriteSubjects: string[];
		customSubjects: string[];
	}) => void;
}

export function SubjectsEditor({
	favoriteSubjects,
	customSubjects,
	onChange,
}: Props) {
	const [draft, setDraft] = useState("");

	function togglePredefined(id: string) {
		const next = favoriteSubjects.includes(id)
			? favoriteSubjects.filter((i) => i !== id)
			: [...favoriteSubjects, id];
		onChange({ favoriteSubjects: next, customSubjects });
	}

	function addCustom() {
		const next = addCustomEntry(draft, favoriteSubjects, customSubjects);
		onChange({ favoriteSubjects: next.all, customSubjects: next.custom });
		setDraft("");
	}

	function removeCustom(value: string) {
		const next = removeCustomEntry(value, favoriteSubjects, customSubjects);
		onChange({ favoriteSubjects: next.all, customSubjects: next.custom });
	}

	return (
		<div className="flex flex-col gap-2">
			<span className="text-sm text-gray-600">Lieblingsfächer</span>
			<div className="flex flex-wrap gap-1">
				{SUBJECTS.map((opt) => {
					const selected = favoriteSubjects.includes(opt.id);
					return (
						<button
							key={opt.id}
							type="button"
							onClick={() => togglePredefined(opt.id)}
							className={`text-xs px-2 py-1 rounded border ${
								selected
									? "bg-blue-100 border-blue-400 text-blue-800"
									: "bg-gray-50 border-gray-300 text-gray-600"
							}`}
						>
							{opt.dataLabel}
						</button>
					);
				})}
			</div>

			<div className="flex flex-col gap-1 mt-1">
				<span className="text-xs text-gray-500">Eigene Fächer</span>
				{customSubjects.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{customSubjects.map((value) => (
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
						placeholder="z. B. Astronomie"
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
		</div>
	);
}
