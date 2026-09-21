import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPersona } from "../../api/client";
import { useEvalStore } from "../../store/useEvalStore";
import { EvalAuthGate } from "../eval/EvalAuthGate";
import { EvalNav } from "../eval/EvalNav";

export function PersonasPage() {
	return (
		<EvalAuthGate>
			<PersonasPageInner />
		</EvalAuthGate>
	);
}

const EMPTY_PROFILE = {
	inSchool: false,
	educationLevel: null,
	favoriteSubjects: [],
	customSubjects: [],
	interests: [],
	preferredJobs: [],
	customInterests: [],
	workExpectations: [],
	customWorkExpectations: [],
	strengths: {},
	customStrengths: [],
	selectedCustomStrengths: [],
	practicalExperiences: [],
	selectedPracticalExperienceIds: [],
	workPreferences: {},
	noGos: {},
	customNoGos: [],
};

function PersonasPageInner() {
	const navigate = useNavigate();
	const personas = useEvalStore((s) => s.personas);
	const fetchPersonas = useEvalStore((s) => s.fetchPersonas);
	const addPersona = useEvalStore((s) => s.addPersona);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (personas === null) {
			fetchPersonas().catch((err) =>
				setError(err instanceof Error ? err.message : String(err)),
			);
		}
	}, [personas, fetchPersonas]);

	async function handleCreate() {
		try {
			const created = await createPersona({
				name: "Neue Persona",
				description: null,
				profile: EMPTY_PROFILE,
				tierS: [],
				tierA: [],
				tierC: [],
			});
			addPersona(created);
			navigate(`/personas/${created.id}`);
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		}
	}

	return (
		<div className="max-w-none w-full p-6 bg-white min-h-[100dvh]">
			<EvalNav />
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-xl font-semibold">Personas</h1>
				<button
					type="button"
					onClick={handleCreate}
					className="bg-blue-600 text-white px-4 py-1 rounded text-sm"
				>
					+ Neue Persona
				</button>
			</div>

			<p className="text-sm text-sky-shade-160 mb-4 max-w-2xl">
				Personas testen, ob deine Pipeline gute Ergebnisse für unterschiedliche
				Profile liefert. Jede Persona hat eine Liste idealer Berufe (Tier S),
				akzeptabler Alternativen (Tier A) und Berufe, die nicht erscheinen
				sollten (Tier C). Daraus wird pro Eval-Lauf ein Score berechnet.
			</p>

			{error && (
				<div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2 mb-4">
					{error}
				</div>
			)}

			{personas === null && (
				<div className="text-sm text-sky-shade-110">Lädt…</div>
			)}

			{personas && personas.length === 0 && (
				<div className="text-sm text-sky-shade-110">
					Noch keine Personas. Klicke "+ Neue Persona", um zu starten.
				</div>
			)}

			{personas && personas.length > 0 && (
				<ul className="divide-y divide-sky-shade-20 border border-sky-shade-20 rounded">
					{personas.map((p) => (
						<li key={p.id} className="flex gap-3 items-start p-3">
							<Link
								to={`/personas/${p.id}`}
								className="flex-1 hover:bg-sky-shade-10 -m-1 p-1 rounded"
							>
								<div className="font-medium">{p.name}</div>
								{p.description && (
									<div className="text-xs text-sky-shade-160">
										{p.description}
									</div>
								)}
								<div className="text-xs text-sky-shade-110 mt-1">
									Tier S: {p.tierS.length} · A: {p.tierA.length} · C:{" "}
									{p.tierC.length}
								</div>
								<div className="text-xs text-sky-shade-80 mt-0.5">
									Aktualisiert{" "}
									{new Date(p.updatedAt).toLocaleDateString("de-DE")}
								</div>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
