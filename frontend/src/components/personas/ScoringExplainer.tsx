import { useState } from "react";

interface Props {
	storageKey?: string;
	defaultOpen?: boolean;
}

const STORAGE_PREFIX = "scoringExplainer.";

export function ScoringExplainer({
	storageKey = "default",
	defaultOpen = true,
}: Props) {
	const fullKey = `${STORAGE_PREFIX}${storageKey}.open`;
	const [open, setOpen] = useState<boolean>(() => {
		if (typeof window === "undefined") {
			return defaultOpen;
		}
		const stored = localStorage.getItem(fullKey);
		if (stored === null) {
			return defaultOpen;
		}
		return stored === "true";
	});

	function toggle() {
		const next = !open;
		setOpen(next);
		if (typeof window !== "undefined") {
			localStorage.setItem(fullKey, String(next));
		}
	}

	return (
		<div className="border border-sky-shade-20 rounded mb-4 text-sm">
			<button
				type="button"
				onClick={toggle}
				className="w-full flex items-center justify-between p-2 text-left text-gray-800"
				aria-expanded={open}
			>
				<span className="font-medium">So funktioniert die Bewertung</span>
				<span className="text-xs">{open ? "▾" : "▸"}</span>
			</button>
			{open && (
				<div className="px-3 pb-3 pt-1 text-xs text-gray-700 space-y-2">
					<p>Pro Persona werden die Top 8 Ergebnisse bewertet:</p>
					<ul className="space-y-0.5 ml-2">
						<li>
							<span className="inline-block w-20 font-medium text-emerald-800">
								Tier S
							</span>
							ideale Treffer — <strong>2 Punkte</strong> je Eintrag im Top 8
						</li>
						<li>
							<span className="inline-block w-20 font-medium text-amber-800">
								Tier A
							</span>
							akzeptable Alternativen — <strong>1 Punkt</strong> je Eintrag
						</li>
						<li>
							<span className="inline-block w-20 font-medium text-red-800">
								Tier C
							</span>
							No-Gos — <strong>automatisches FAIL</strong> wenn im Top 8
						</li>
					</ul>
					<p>Maximal 16 Punkte (8 × Tier S). Score in Prozent davon.</p>
					<ul className="space-y-0.5 ml-2">
						<li>
							<span className="inline-block w-20">100 %</span>
							STRONG PASS
						</li>
						<li>
							<span className="inline-block w-20">80–99 %</span>
							PASS
						</li>
						<li>
							<span className="inline-block w-20">50–79 %</span>
							CONCERNS
						</li>
						<li>
							<span className="inline-block w-20">{"< 50 %"}</span>
							FAIL
						</li>
						<li>
							<span className="inline-block w-20">Tier C</span>
							sofortiges FAIL (überschreibt den Score)
						</li>
					</ul>
					<p>
						<strong>Run-Score</strong> = Durchschnitt der Persona-Scores; jede
						Persona zählt gleich.
					</p>
				</div>
			)}
		</div>
	);
}
