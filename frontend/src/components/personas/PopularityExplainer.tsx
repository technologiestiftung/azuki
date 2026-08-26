import { useState } from "react";

interface Props {
	storageKey?: string;
	defaultOpen?: boolean;
}

const STORAGE_PREFIX = "popularityExplainer.";

export function PopularityExplainer({
	storageKey = "default",
	defaultOpen = false,
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
		<div className="border border-sky-shade-20 rounded mb-2 text-sm">
			<button
				type="button"
				onClick={toggle}
				className="w-full flex items-center justify-between p-2 text-left text-gray-800"
				aria-expanded={open}
			>
				<span className="font-medium">Was bedeuten die Häufigkeiten?</span>
				<span className="text-xs">{open ? "▾" : "▸"}</span>
			</button>
			{open && (
				<div className="px-3 pb-3 pt-1 text-xs text-gray-700 space-y-3">
					<div>
						<p className="mb-1 font-medium text-gray-800">
							Woher die Daten kommen
						</p>
						<p>
							Jeder Beruf ist nach der Anzahl neuer Auszubildender pro Jahr
							eingestuft. Zwei Quellen:
						</p>
						<ul className="ml-4 mt-1 list-disc space-y-0.5">
							<li>
								<strong>BIBB DAZUBI 2024</strong> — neue Ausbildungsverträge im
								dualen System (Bundesinstitut für Berufsbildung, 329 Berufe).
							</li>
							<li>
								<strong>Destatis Berufliche Schulen 2023/24</strong> —
								Schüler/-innen im 1. Schuljahrgang an Berufsfachschulen,
								Fachschulen und Schulen des Gesundheitswesens (Statistisches
								Bundesamt, 306 Berufe).
							</li>
						</ul>
						<p className="mt-1 text-gray-500">
							Insgesamt 511 von 668 Berufen haben eine echte Zahl. Der Rest sind
							Sonderfälle (siehe unten).
						</p>
					</div>

					<div>
						<p className="mb-1 font-medium text-gray-800">Die Klassen</p>
						<ul className="ml-2 space-y-0.5">
							<li>
								<span className="inline-block w-32 font-medium text-emerald-800">
									häufig
								</span>
								≥ 5.000 / Jahr — bundesweite Top-Berufe, praktisch überall
								verfügbar.
							</li>
							<li>
								<span className="inline-block w-32 font-medium text-emerald-700">
									solide
								</span>
								1.000–5.000 — in den meisten Regionen verfügbar.
							</li>
							<li>
								<span className="inline-block w-32 font-medium text-amber-800">
									klein
								</span>
								200–1.000 — regional unterschiedlich, aber real.
							</li>
							<li>
								<span className="inline-block w-32 font-medium text-orange-800">
									Nische
								</span>
								50–200 — selten. Nur surfacen, wenn das Thema explizit genannt
								wird.
							</li>
							<li>
								<span className="inline-block w-32 font-medium text-red-800">
									Rarität
								</span>
								&lt; 50 — praktisch nicht erreichbar (z. B. Geigenbauer mit 3 /
								Jahr).
							</li>
						</ul>
					</div>

					<div>
						<p className="mb-1 font-medium text-gray-800">Sonderfälle</p>
						<ul className="ml-2 space-y-1">
							<li>
								<span className="inline-block w-32 font-medium text-blue-700 align-top">
									doppelt qualifizierend
								</span>
								<span>
									Ausbildung + Fachhochschulreife in einem Programm. Selten,
									aber dokumentiert.
								</span>
							</li>
							<li>
								<span className="inline-block w-32 font-medium text-gray-600 align-top">
									ohne Zahlen
								</span>
								<span>
									Beruf ist im Datensatz, konnte aber keiner Quelle zugeordnet
									werden — oft sehr alte oder kaum noch vergebene Berufe.
								</span>
							</li>
						</ul>
					</div>

					<div>
						<p className="mb-1 font-medium text-gray-800">Wofür?</p>
						<p>
							Die Häufigkeit zeigt dir auf einen Blick, ob ein Beruf ein
							verlässlicher Anker oder ein Spezialfall ist. Beim Befüllen von
							Tier S / A / C: Anker-Berufe (häufig, solide) sind meist gute
							Tier-S- oder Tier-A-Kandidaten. Raritäten gehören — wenn überhaupt
							— eher in Tier C, außer der Jugendliche nennt das Handwerk
							explizit.
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
