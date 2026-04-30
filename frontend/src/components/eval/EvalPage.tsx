import type { PersonaId } from "@azuki/shared";
import { PERSONA_IDS, RUBRICS, getPopularityTier } from "@azuki/shared";
import { useEvalStore } from "../../store/useEvalStore";
import { PromptEditor } from "./PromptEditor";
import { RunControls } from "./RunControls";
import { PersonaColumn } from "./PersonaColumn";
import { EvalAuthGate } from "./EvalAuthGate";
import { RunScoreBanner } from "./RunScoreBanner";
import { scoreSnapshot } from "./scoring";
import { aggregateRunScore } from "./run-score";
import { rubricReachability } from "./reachability";
import type { RubricReachability } from "./reachability";
import { useMemo } from "react";

export function EvalPage() {
	return (
		<EvalAuthGate>
			<EvalPageInner />
		</EvalAuthGate>
	);
}

function EvalPageInner() {
	const currentRun = useEvalStore((s) => s.currentRun);
	const error = useEvalStore((s) => s.error);
	const isRunning = useEvalStore((s) => s.isRunning);

	const scoreReports = useMemo(() => {
		if (!currentRun) {
			return undefined;
		}
		return scoreSnapshot(currentRun, RUBRICS, getPopularityTier);
	}, [currentRun]);

	const runScore = useMemo(() => {
		if (!scoreReports) {
			return undefined;
		}
		return aggregateRunScore(scoreReports);
	}, [scoreReports]);

	const reachabilityByPersona = useMemo(() => {
		if (!currentRun) {
			return undefined;
		}
		const out = {} as Record<PersonaId, RubricReachability | undefined>;
		for (const id of PERSONA_IDS) {
			const result = currentRun.results[id];
			if (!result || "error" in result) {
				out[id] = undefined;
				continue;
			}
			out[id] = rubricReachability(result.prefilter, RUBRICS[id]);
		}
		return out;
	}, [currentRun]);

	function retry(_personaId: PersonaId) {
		void _personaId;
		document.getElementById("eval-run-btn")?.click();
	}

	return (
		<div className="max-w-none w-full p-6 bg-white min-h-[100dvh]">
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-xl font-semibold">Eval</h1>
			</div>

			<div className="flex flex-col gap-3 mb-6">
				<PromptEditor />
				<RunControls />
				{error && (
					<div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
						{error}
					</div>
				)}
				{isRunning && <div className="text-sm text-gray-600">Running…</div>}
			</div>

			<RunScoreBanner score={runScore} />

			<div className="flex gap-4">
				{PERSONA_IDS.map((id) => (
					<PersonaColumn
						key={id}
						personaId={id}
						current={currentRun?.results[id]}
						report={scoreReports?.[id]}
						reachability={reachabilityByPersona?.[id]}
						onRetry={() => retry(id)}
					/>
				))}
			</div>
		</div>
	);
}
