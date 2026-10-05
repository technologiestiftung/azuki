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
				className="w-full flex items-center justify-between p-2 text-left text-sky-900"
				aria-expanded={open}
			>
				<span className="font-medium">Was bedeuten die Häufigkeiten?</span>
				<span className="text-xs">{open ? "▾" : "▸"}</span>
			</button>
			{open && (
				<div className="px-3 pb-3 pt-1 text-xs text-sky-shade-170 space-y-3">
					<div>
						<p className="mb-1 font-medium text-sky-900">
							Woher die Daten kommen
						</p>
						<p>
							Jeder Beruf ist nach der Anzahl neuer Auszubildender pro Jahr
							eingestuft. Zwei Quellen:
						</p>
						<ul className="ml-4 mt-1 list-disc space-y-0.5">
							<li>
								<strong>BIBB DAZUBI, Berichtsjahr 2024</strong> — neue
								Ausbildungsverträge im dualen System. Quelle: „Datenbank
								Auszubildende" des Bundesinstituts für Berufsbildung auf Basis
								der Daten der Berufsbildungsstatistik der statistischen Ämter
								des Bundes und der Länder (Erhebung zum 31.12.). Absolutwerte
								aus Datenschutzgründen jeweils auf ein Vielfaches von 3
								gerundet; Berechnungen des Bundesinstituts für Berufsbildung,{" "}
								<a
									href="https://www.bibb.de/dazubi"
									target="_blank"
									rel="noopener noreferrer"
									className="underline"
								>
									bibb.de/dazubi
								</a>
								, Lizenz{" "}
								<a
									href="https://creativecommons.org/licenses/by-nc-nd/4.0/deed.de"
									target="_blank"
									rel="noopener noreferrer"
									className="underline"
								>
									CC BY-NC-ND 4.0
								</a>
								. Stufen: eigene Berechnung.
							</li>
							<li>
								<strong>Destatis Berufliche Schulen 2024/25</strong> —
								Schüler/-innen im 1. Schuljahrgang an Berufsfachschulen,
								Fachschulen und Schulen des Gesundheitswesens. Quelle:
								Statistisches Bundesamt (Destatis), Statistischer Bericht
								Berufliche Schulen und Schulen des Gesundheitswesens –
								Berufsbezeichnungen, Schuljahr 2024/2025 (Tabellen 21121-10 bis
								21121-13),{" "}
								<a
									href="https://www.destatis.de/DE/Service/Impressum/copyright-allgemein.html"
									target="_blank"
									rel="noopener noreferrer"
									className="underline"
								>
									© Destatis
								</a>
								. Daten geändert: eigene Berechnung (Zuordnung zu Berufen).
							</li>
						</ul>
						<p className="mt-1 text-sky-shade-110">
							Berufe ohne Zahl sind Sonderfälle (siehe unten).
						</p>
					</div>

					<div>
						<p className="mb-1 font-medium text-sky-900">Die Klassen</p>
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
						<p className="mb-1 font-medium text-sky-900">Sonderfälle</p>
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
								<span className="inline-block w-32 font-medium text-sky-shade-160 align-top">
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
						<p className="mb-1 font-medium text-sky-900">Wofür?</p>
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
