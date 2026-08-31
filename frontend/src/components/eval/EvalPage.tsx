import { useEffect, useMemo } from "react";
import { useEvalStore } from "../../store/useEvalStore";
import { PromptEditor } from "./PromptEditor";
import { RunControls } from "./RunControls";
import { PersonaColumn } from "./PersonaColumn";
import { EvalAuthGate } from "./EvalAuthGate";
import { EvalNav } from "./EvalNav";
import { RunScoreBanner } from "./RunScoreBanner";
import { ScoringExplainer } from "../personas/ScoringExplainer";
import { scoreSnapshot } from "./scoring";
import { aggregateRunScore } from "./run-score";
import { rubricReachability, type RubricReachability } from "./reachability";

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
	const personas = useEvalStore((s) => s.personas);
	const selectedPersonaIds = useEvalStore((s) => s.selectedPersonaIds);
	const fetchPersonas = useEvalStore((s) => s.fetchPersonas);

	useEffect(() => {
		if (personas === null) {
			fetchPersonas().catch(() => {
				/* error handled via toast in api client; UI shows empty state */
			});
		}
	}, [personas, fetchPersonas]);

	const selectedPersonas = useMemo(() => {
		if (!personas) {
			return [];
		}
		return personas.filter((p) => selectedPersonaIds.has(p.id));
	}, [personas, selectedPersonaIds]);

	const scoreReports = useMemo(() => {
		if (!currentRun || selectedPersonas.length === 0) {
			return undefined;
		}
		return scoreSnapshot(currentRun, selectedPersonas);
	}, [currentRun, selectedPersonas]);

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
		const out: Record<string, RubricReachability | undefined> = {};
		for (const persona of selectedPersonas) {
			const result = currentRun.results[persona.id];
			if (!result || "error" in result) {
				out[persona.id] = undefined;
				continue;
			}
			out[persona.id] = rubricReachability(result.prefilter, persona);
		}
		return out;
	}, [currentRun, selectedPersonas]);

	function retry() {
		document.getElementById("eval-run-btn")?.click();
	}

	return (
		<div className="max-w-none w-full p-6 bg-white min-h-[100dvh]">
			<EvalNav />
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
				{isRunning && (
					<div className="text-sm text-sky-shade-160">Running…</div>
				)}
			</div>

			<ScoringExplainer storageKey="evalPage" defaultOpen={true} />

			<RunScoreBanner score={runScore} />

			<div className="flex gap-4">
				{selectedPersonas.map((persona) => (
					<PersonaColumn
						key={persona.id}
						persona={persona}
						current={currentRun?.results[persona.id]}
						report={scoreReports?.[persona.id]}
						reachability={reachabilityByPersona?.[persona.id]}
						onRetry={retry}
					/>
				))}
			</div>
		</div>
	);
}
