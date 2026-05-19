import { useEffect, useState } from "react";
import { useEvalStore } from "../../store/useEvalStore";
import { getDefaultPrompt } from "../../api/client";

export function PromptEditor() {
	const prompt = useEvalStore((s) => s.prompt);
	const setPrompt = useEvalStore((s) => s.setPrompt);
	const [defaultPrompt, setDefaultPrompt] = useState<string | null>(null);

	useEffect(() => {
		getDefaultPrompt()
			.then((p) => {
				setDefaultPrompt(p);
				if (!prompt) {
					setPrompt(p);
				}
			})
			.catch(() => {
				/* swallow — handled in EvalPage */
			});
	}, []);

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between text-sm">
				<label htmlFor="eval-prompt" className="font-medium">
					System Prompt
				</label>
				{defaultPrompt && defaultPrompt !== prompt && (
					<button
						type="button"
						onClick={() => setPrompt(defaultPrompt)}
						className="text-blue-600 underline"
					>
						Reset to default
					</button>
				)}
			</div>
			<textarea
				id="eval-prompt"
				value={prompt}
				onChange={(e) => setPrompt(e.target.value)}
				rows={12}
				className="w-full font-mono text-xs p-3 border border-gray-300 rounded"
			/>
		</div>
	);
}
