import { useState, useMemo } from "react";
import { POPULARITY_INDEX, type PopularityTier } from "@azuki/shared";
import { searchOccupations } from "./occupation-search";
import { PopularityExplainer } from "./PopularityExplainer";

interface PickAction {
	label: string;
	onPick: (id: number, name: string) => void;
}

interface Props {
	actions: PickAction[];
	excludeIds?: Set<number>;
	initialFilter?: PopularityTier;
}

const TIER_LABEL: Record<PopularityTier, string> = {
	A_anchor: "häufig",
	B_solid: "solide",
	C_smallReal: "klein",
	D_niche: "Nische",
	E_vanishing: "Rarität",
	F_doppelqual: "doppelt qual.",
	G_unknown: "?",
};

// Long labels with count ranges, shown in the filter dropdown so the meaning
// of each tier is self-explanatory without a separate legend.
const TIER_LABEL_LONG: Record<PopularityTier, string> = {
	A_anchor: "häufig (≥ 5.000/Jahr)",
	B_solid: "solide (1.000–5.000/Jahr)",
	C_smallReal: "klein (200–1.000/Jahr)",
	D_niche: "Nische (50–200/Jahr)",
	E_vanishing: "Rarität (< 50/Jahr)",
	F_doppelqual: "doppelt qualifizierend",
	G_unknown: "ohne Zahlen",
};

// Tooltip shown on the per-row tier badge.
const TIER_TOOLTIP: Record<PopularityTier, string> = {
	A_anchor: "≥ 5.000 neue Auszubildende pro Jahr",
	B_solid: "1.000–5.000 neue Auszubildende pro Jahr",
	C_smallReal: "200–1.000 neue Auszubildende pro Jahr",
	D_niche: "50–200 neue Auszubildende pro Jahr",
	E_vanishing: "weniger als 50 neue Auszubildende pro Jahr",
	F_doppelqual: "Doppelt qualifizierend (Ausbildung + Fachhochschulreife)",
	G_unknown: "Keine Häufigkeitsdaten verfügbar",
};

const TIER_BADGE: Record<PopularityTier, string> = {
	A_anchor: "bg-emerald-100 text-emerald-800",
	B_solid: "bg-emerald-50 text-emerald-700",
	C_smallReal: "bg-amber-100 text-amber-800",
	D_niche: "bg-orange-100 text-orange-800",
	E_vanishing: "bg-red-100 text-red-800",
	F_doppelqual: "bg-blue-50 text-blue-700",
	G_unknown: "bg-sky-shade-10 text-gray-700",
};

export function OccupationPicker({
	actions,
	excludeIds,
	initialFilter,
}: Props) {
	const [query, setQuery] = useState("");
	const [tierFilter, setTierFilter] = useState<PopularityTier | "">(
		initialFilter ?? "",
	);

	const { results, total } = useMemo(() => {
		return searchOccupations(POPULARITY_INDEX, {
			query,
			tier: tierFilter || undefined,
			limit: 50,
		});
	}, [query, tierFilter]);
	const isFiltered = query.trim().length > 0 || tierFilter !== "";

	return (
		<div className="border border-sky-shade-20 rounded p-2 text-xs">
			<PopularityExplainer storageKey="occupationPicker" />
			<div className="flex gap-2 mb-2">
				<input
					type="search"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Beruf suchen…"
					className="flex-1 border border-sky-shade-30 rounded px-2 py-1"
				/>
				<select
					value={tierFilter}
					onChange={(e) =>
						setTierFilter((e.target.value as PopularityTier) || "")
					}
					className="border border-sky-shade-30 rounded px-2 py-1"
					title="Filter nach Häufigkeit (neue Auszubildende pro Jahr — Quelle: BIBB DAZUBI + Destatis)"
				>
					<option value="">Alle Häufigkeiten</option>
					{Object.entries(TIER_LABEL_LONG).map(([id, label]) => (
						<option key={id} value={id}>
							{label}
						</option>
					))}
				</select>
			</div>

			<div className="flex items-center gap-3 py-1 text-[10px] uppercase tracking-wide text-gray-500 border-b border-sky-shade-20">
				<span className="flex-1 min-w-0">Beruf</span>
				<span className="w-28">Häufigkeit</span>
				<span
					className="w-16 text-right"
					title="Auszubildende pro Jahr (DAZUBI/Destatis)"
				>
					Anf./Jahr
				</span>
				{actions.length > 0 && (
					<span className="w-24 text-right text-gray-400">Hinzufügen</span>
				)}
			</div>

			<ul className="max-h-96 overflow-y-auto divide-y divide-sky-shade-10">
				{results.map((r) => {
					const excluded = excludeIds?.has(r.id);
					return (
						<li
							key={r.id}
							className={`flex items-center gap-3 py-1 ${excluded ? "opacity-50" : ""}`}
						>
							<span className="flex-1 min-w-0 truncate" title={r.name}>
								{r.name}
							</span>
							<span className="w-28">
								<span
									className={`text-[10px] px-1.5 rounded ${TIER_BADGE[r.popularityTier]}`}
									title={TIER_TOOLTIP[r.popularityTier]}
								>
									{TIER_LABEL[r.popularityTier]}
								</span>
							</span>
							<span className="w-16 text-right text-gray-500">
								{r.dazubiContracts ?? "—"}
							</span>
							{actions.length > 0 && (
								<span className="w-24 flex justify-end gap-1">
									{actions.map((a) => (
										<button
											key={a.label}
											type="button"
											onClick={() => a.onPick(r.id, r.name)}
											className="text-blue-600 underline px-1"
										>
											{a.label}
										</button>
									))}
								</span>
							)}
						</li>
					);
				})}
				{results.length === 0 && (
					<li className="text-gray-500 py-2">Keine Treffer</li>
				)}
			</ul>

			{results.length > 0 && (
				<div className="mt-2 pt-2 border-t border-sky-shade-10 text-[11px] text-gray-500">
					{results.length < total ? (
						<>
							Zeige {results.length} von {total}
							{isFiltered ? " Treffern" : " Berufen"} —{" "}
							{isFiltered
								? "weiter eingrenzen, um den Rest zu sehen"
								: "bitte Suche oder Häufigkeitsfilter benutzen, um einzugrenzen"}
							.
						</>
					) : (
						<>
							{total} {total === 1 ? "Treffer" : "Treffer"}
							{isFiltered ? "" : " gesamt"}.
						</>
					)}
				</div>
			)}
		</div>
	);
}
