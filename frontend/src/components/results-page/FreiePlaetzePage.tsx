import { useEffect, useState } from "react";
import type { AusbildungsplatzResult, MatchedOccupation } from "@azuki/shared";
import { useMatchResultsStore } from "../../store/useMatchResultsStore";
import { useAppStore } from "../../store/useAppStore";
import { fetchAusbildungsplaetze } from "../../api/client";
import { content } from "../../content";
import { ResultsPageHeader } from "./ResultsPageHeader";
import { StandortBanner } from "./StandortBanner";

function formatStartDate(iso: string | undefined): string | null {
	if (!iso) {
		return null;
	}
	const parsed = new Date(iso);
	if (Number.isNaN(parsed.getTime())) {
		return null;
	}
	const dd = String(parsed.getDate()).padStart(2, "0");
	const mm = String(parsed.getMonth() + 1).padStart(2, "0");
	const yyyy = parsed.getFullYear();
	return `${dd}.${mm}.${yyyy}`;
}

interface BerufCardProps {
	occupation: MatchedOccupation;
	stellen: AusbildungsplatzResult | undefined;
	umkreis: number;
	loading: boolean;
}

function renderStellenContent(
	stellen: AusbildungsplatzResult | undefined,
	umkreis: number,
	loading: boolean,
) {
	if (loading && stellen === undefined) {
		return <span className="text-sm text-gray-400">…</span>;
	}
	if (stellen === undefined || stellen.totalCount === 0) {
		return (
			<span className="text-sm text-gray-500">
				{content["results.badge.empty"]}
			</span>
		);
	}
	return (
		<>
			<div className="text-sm font-semibold text-sky-700 mb-3">
				{stellen.totalCount} {content["results.badge.suffix"]} · {umkreis} km
			</div>

			{stellen.previews.length > 0 && (
				<>
					<p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
						{content["results.previewHeading"]}
					</p>
					<ul className="space-y-2 mb-3">
						{stellen.previews.map((preview, i) => {
							const startDate = formatStartDate(preview.eintrittsdatum);
							return (
								<li key={i} className="text-sm">
									<div className="text-gray-900 font-medium">
										{preview.employer}
									</div>
									<div className="text-gray-500">
										{preview.city}
										{startDate &&
											` · ${content["results.startDatePrefix"]} ${startDate}`}
									</div>
								</li>
							);
						})}
					</ul>
				</>
			)}

			<a
				href={stellen.searchUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="text-sm font-medium text-sky-700 hover:text-sky-800"
			>
				{content["results.showAllLink"]} →
			</a>
		</>
	);
}

function BerufCard({ occupation, stellen, umkreis, loading }: BerufCardProps) {
	return (
		<div className="bg-white rounded-2xl border border-gray-200 p-4">
			<h3 className="text-lg font-semibold text-gray-900 mb-2">
				{occupation.name}
			</h3>
			{renderStellenContent(stellen, umkreis, loading)}
		</div>
	);
}

export function FreiePlaetzePage() {
	const matchResults = useMatchResultsStore((state) => state.matchResults);
	const ausbildungsplaetze = useAppStore((state) => state.ausbildungsplaetze);
	const setAusbildungsplaetze = useAppStore(
		(state) => state.setAusbildungsplaetze,
	);
	const standort = useAppStore((state) => state.standort);
	const occupations = matchResults?.occupations ?? [];
	const [fetchError, setFetchError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (occupations.length === 0 || ausbildungsplaetze !== null) {
			return () => {};
		}
		const controller = new AbortController();
		const berufe = occupations.map((o) => o.name);
		setFetchError(null);
		setLoading(true);
		(async () => {
			try {
				const response = await fetchAusbildungsplaetze(standort.plz, berufe, {
					umkreis: standort.umkreis,
					signal: controller.signal,
				});
				if (!controller.signal.aborted) {
					setAusbildungsplaetze(response);
				}
			} catch (err) {
				if (controller.signal.aborted) {
					return;
				}
				if (err instanceof DOMException && err.name === "AbortError") {
					return;
				}
				setFetchError(content["results.fetchError"]);
			} finally {
				if (!controller.signal.aborted) {
					setLoading(false);
				}
			}
		})();
		return () => {
			controller.abort();
		};
	}, [
		ausbildungsplaetze,
		occupations,
		setAusbildungsplaetze,
		standort.plz,
		standort.umkreis,
	]);

	const stellenByName = new Map(
		ausbildungsplaetze?.results.map((r) => [r.beruf, r]) ?? [],
	);

	return (
		<div className="flex flex-col h-full">
			<ResultsPageHeader title={content["results.title"]} />
			<StandortBanner />
			{fetchError && (
				<p className="px-4 pt-2 text-xs text-red-500">{fetchError}</p>
			)}

			<div className="flex-1 px-4 pb-4 pt-3 space-y-3 overflow-y-auto">
				{occupations.length === 0 ? (
					<p className="text-sm text-gray-500">
						{content["freiePlaetze.noResults"]}
					</p>
				) : (
					occupations.map((occupation: MatchedOccupation) => (
						<BerufCard
							key={occupation.id}
							occupation={occupation}
							stellen={stellenByName.get(occupation.name)}
							umkreis={standort.umkreis}
							loading={loading}
						/>
					))
				)}
			</div>
		</div>
	);
}
