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

	async function handleRun() {
		setRunning(true);
		setError(null);
		try {
			const snapshot = await runEvalRequest(prompt, model);
			pushNewRun(snapshot);
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setRunning(false);
		}
	}

	return (
		<div className="flex items-center gap-3 text-sm">
			<label className="flex items-center gap-2">
				Model:
				<select
					value={model}
					onChange={(e) => setModel(e.target.value)}
					className="border border-gray-300 rounded px-2 py-1"
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
				disabled={isRunning || !prompt}
				className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
			>
				{isRunning ? "Running…" : "Run"}
			</button>
		</div>
	);
}
