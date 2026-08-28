import { AI_MODELS } from "@azuki/shared";
import { useEvalStore } from "../../store/useEvalStore";
import { runEvalRequest } from "../../api/client";

export function RunControls() {
	const prompt = useEvalStore((s) => s.prompt);
	const model = useEvalStore((s) => s.model);
	const setModel = useEvalStore((s) => s.setModel);
	const isRunning = useEvalStore((s) => s.isRunning);
	const setRunning = useEvalStore((s) => s.setRunning);
	const setError = useEvalStore((s) => s.setError);
	const pushNewRun = useEvalStore((s) => s.pushNewRun);
	const personas = useEvalStore((s) => s.personas);
	const selectedPersonaIds = useEvalStore((s) => s.selectedPersonaIds);
	const togglePersonaSelection = useEvalStore((s) => s.togglePersonaSelection);
	const setSelectedPersonaIds = useEvalStore((s) => s.setSelectedPersonaIds);

	async function handleRun() {
		setRunning(true);
		setError(null);
		try {
			const ids = Array.from(selectedPersonaIds);
			const snapshot = await runEvalRequest(prompt, model, ids);
			pushNewRun(snapshot);
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setRunning(false);
		}
	}

	const allIds = (personas ?? []).map((p) => p.id);
	const selectAll = () => setSelectedPersonaIds(new Set(allIds));
	const selectNone = () => setSelectedPersonaIds(new Set());
	const canRun =
		!isRunning && prompt.trim().length > 0 && selectedPersonaIds.size > 0;

	return (
		<div className="flex flex-col gap-2 text-sm">
			{personas && personas.length > 0 && (
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-gray-600">
						Personas in this run ({selectedPersonaIds.size} of {personas.length}
						):
					</span>
					{personas.map((p) => {
						const selected = selectedPersonaIds.has(p.id);
						return (
							<button
								key={p.id}
								type="button"
								onClick={() => togglePersonaSelection(p.id)}
								className={`text-xs px-2 py-1 rounded border ${
									selected
										? "bg-blue-100 border-blue-400 text-blue-800"
										: "bg-gray-50 border-sky-shade-30 text-gray-600"
								}`}
							>
								{selected ? "☑ " : "☐ "}
								{p.name}
							</button>
						);
					})}
					<button
						type="button"
						onClick={selectAll}
						className="text-xs text-blue-600 underline"
					>
						Select all
					</button>
					<button
						type="button"
						onClick={selectNone}
						className="text-xs text-blue-600 underline"
					>
						Select none
					</button>
				</div>
			)}

			<div className="flex items-center gap-3">
				<label className="flex items-center gap-2">
					Model:
					<select
						value={model}
						onChange={(e) => setModel(e.target.value)}
						className="border border-sky-shade-30 rounded px-2 py-1"
					>
						{AI_MODELS.map((m) => (
							<option key={m.id} value={m.id}>
								{m.label}
							</option>
						))}
					</select>
				</label>

				<button
					type="button"
					id="eval-run-btn"
					onClick={handleRun}
					disabled={!canRun}
					className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
				>
					{isRunning ? "Running…" : "Run"}
				</button>
			</div>
		</div>
	);
}
