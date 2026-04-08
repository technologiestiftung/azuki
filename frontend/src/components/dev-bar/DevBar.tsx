import { AI_MODELS } from "@azuki/shared";
import { useAppStore } from "../../store/useAppStore";

export function DevBar() {
	const selectedModel = useAppStore((state) => state.selectedModel);
	const setSelectedModel = useAppStore((state) => state.setSelectedModel);
	const matchResults = useAppStore((state) => state.matchResults);
	const generation = matchResults?.generation;

	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/90 text-white text-xs px-4 py-2 flex items-center gap-4 backdrop-blur-sm">
			<span className="font-semibold shrink-0">DEV</span>

			<select
				value={selectedModel ?? ""}
				onChange={(e) => setSelectedModel(e.target.value || null)}
				className="bg-gray-800 text-white text-xs rounded px-2 py-1 border border-gray-600"
			>
				<option value="">Server Default</option>
				{AI_MODELS.map((m) => (
					<option key={m.id} value={m.id}>
						{m.label}
					</option>
				))}
			</select>

			{generation && (
				<div className="flex items-center gap-3 text-gray-300">
					<span>
						Model: <span className="text-white">{generation.model}</span>
					</span>
					<span>
						Cost:{" "}
						<span className="text-green-400">
							${generation.cost.toFixed(4)}
						</span>
					</span>
					<span>
						In:{" "}
						<span className="text-white">
							{generation.tokensInput.toLocaleString()}
						</span>
					</span>
					<span>
						Out:{" "}
						<span className="text-white">
							{generation.tokensOutput.toLocaleString()}
						</span>
					</span>
				</div>
			)}
		</div>
	);
}
