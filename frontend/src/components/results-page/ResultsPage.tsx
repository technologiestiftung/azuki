import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { content } from "../../content/de";
import { SecondaryButton } from "../primitives/buttons/SecondaryButton";
import { fetchAusbildungsplaetze } from "../../api/client";
import { StandortBanner } from "./StandortBanner";
import {
	type MatchedOccupation,
	type AusbildungsplatzResult,
} from "@azuki/shared";

function formatBerlinBrandenburg(): string {
	return content["results.region"];
}

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

interface CardProps {
	occupation: MatchedOccupation;
	index: number;
	stellenResult: AusbildungsplatzResult | undefined;
	loading: boolean;
	expanded: boolean;
	onToggle: () => void;
	umkreis: number;
}

function ResultCard({
	occupation,
	index,
	stellenResult,
	loading,
	expanded,
	onToggle,
	umkreis,
}: CardProps) {
	const count = stellenResult?.totalCount ?? 0;
	const hasResults = count > 0;
	const canExpand = hasResults && stellenResult !== undefined;

	return (
		<div className="bg-gray-50 rounded-3xl overflow-hidden">
			<button
				type="button"
				onClick={canExpand ? onToggle : undefined}
				disabled={!canExpand}
				className="w-full text-left disabled:cursor-default"
				aria-expanded={canExpand ? expanded : undefined}
			>
				{occupation.images[0]?.url && (
					<img
						src={occupation.images[0].url}
						alt={occupation.name}
						className="w-full h-40 object-cover"
					/>
				)}
				<div className="p-4">
					<div className="flex items-start justify-between gap-2 mb-1">
						<span className="text-sm font-semibold text-gray-400">
							#{index + 1}
						</span>
						<StellenBadge count={count} loading={loading} umkreis={umkreis} />
					</div>
					<h3 className="text-lg leading-6 font-bold mb-2">
						{occupation.name}
					</h3>
					<p className="text-sm text-gray-600 mb-3">{occupation.reasoning}</p>
					{occupation.taskSummary && (
						<p className="text-xs text-gray-500 line-clamp-3">
							{occupation.taskSummary}
						</p>
					)}
				</div>
			</button>

			{expanded && stellenResult && (
				<div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3">
					<p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
						{content["results.previewHeading"]}
					</p>
					<ul className="space-y-2">
						{stellenResult.previews.map((preview, i) => {
							const startDate = formatStartDate(preview.eintrittsdatum);
							return (
								<li key={i} className="text-sm text-gray-700">
									<div>
										<span className="font-medium">{preview.employer}</span>
										<span className="text-gray-500"> — {preview.city}</span>
									</div>
									{startDate && (
										<div className="text-xs text-gray-500 mt-0.5">
											{content["results.startDatePrefix"]} {startDate}
										</div>
									)}
								</li>
							);
						})}
					</ul>
					<a
						href={stellenResult.searchUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-block text-sm font-medium text-sky-600 hover:text-sky-700"
					>
						{content["results.showAllLink"]} →
					</a>
				</div>
			)}
		</div>
	);
}

function StellenBadge({
	count,
	loading,
	umkreis,
}: {
	count: number;
	loading: boolean;
	umkreis: number;
}) {
	if (loading) {
		return <span className="text-xs text-gray-400 shrink-0 mt-0.5">…</span>;
	}
	if (count === 0) {
		return (
			<span className="text-xs text-gray-400 shrink-0 mt-0.5">
				{content["results.badge.empty"]}
			</span>
		);
	}
	return (
		<span className="text-xs font-semibold text-sky-700 bg-sky-100 px-2 py-1 rounded-full shrink-0">
			{count} {content["results.badge.suffix"]} · {umkreis} km
		</span>
	);
}

export function ResultsPage() {
	const navigate = useNavigate();
	const matchResults = useAppStore((state) => state.matchResults);
	const profile = useAppStore((state) => state.profile);
	const ausbildungsplaetze = useAppStore((state) => state.ausbildungsplaetze);
	const setAusbildungsplaetze = useAppStore(
		(state) => state.setAusbildungsplaetze,
	);
	const standort = useAppStore((state) => state.standort);

	const occupations = matchResults?.occupations ?? [];
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [expandedId, setExpandedId] = useState<number | null>(null);

	useEffect(() => {
		if (occupations.length === 0 || ausbildungsplaetze !== null) {
			return () => {};
		}

		const controller = new AbortController();
		const berufe = occupations.map((o) => o.name);
		setLoading(true);
		setError(null);

		(async () => {
			try {
				const response = await fetchAusbildungsplaetze(
					standort.plz,
					berufe,
					standort.umkreis,
				);
				if (!controller.signal.aborted) {
					setAusbildungsplaetze(response);
				}
			} catch {
				if (!controller.signal.aborted) {
					setError(content["results.fetchError"]);
				}
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

	const handleNewStart = () => {
		useAppStore.getState().resetProfile();
		navigate("/welcome");
	};

	const stellenByName = new Map(
		ausbildungsplaetze?.results.map((r) => [r.beruf, r]) ?? [],
	);

	return (
		<div className="flex flex-col h-full">
			{occupations.length > 0 && <StandortBanner />}

			<div className="px-4 pt-4 pb-3">
				<h1 className="text-3xl font-bold">{content["results.title"]}</h1>
				<p className="text-base text-gray-500 mt-2">
					{occupations.length > 0
						? `Wir haben ${occupations.length} Ausbildungen gefunden, die zu dir passen — in ${formatBerlinBrandenburg()}.`
						: "Basierend auf deinem Profil haben wir passende Ausbildungen für dich gefunden."}
				</p>
				{error && <p className="text-xs text-red-500 mt-2">{error}</p>}
			</div>

			<div className="flex-1 px-4 pb-4 space-y-4 overflow-y-auto">
				{occupations.length > 0 ? (
					occupations.map((occupation: MatchedOccupation, index: number) => (
						<ResultCard
							key={occupation.id}
							occupation={occupation}
							index={index}
							stellenResult={stellenByName.get(occupation.name)}
							loading={loading && !ausbildungsplaetze}
							expanded={expandedId === occupation.id}
							onToggle={() =>
								setExpandedId(
									expandedId === occupation.id ? null : occupation.id,
								)
							}
							umkreis={standort.umkreis}
						/>
					))
				) : (
					<div className="bg-gray-50 rounded-3xl p-6">
						<p className="text-base text-gray-600 mb-4">
							Dein Profil wurde erstellt. Starte den Backend-Server, um deine
							Top-Ausbildungsberufe zu sehen.
						</p>
						<div className="space-y-2 text-sm text-gray-500">
							<p>
								<strong>Schulabschluss:</strong> {profile.educationLevel || "–"}
							</p>
							<p>
								<strong>Lieblingsfächer:</strong>{" "}
								{profile.favoriteSubjects.join(", ") || "–"}
							</p>
							<p>
								<strong>Interessen:</strong>{" "}
								{profile.interests.join(", ") || "–"}
							</p>
							<p>
								<strong>Stärken:</strong>{" "}
								{Object.entries(profile.strengths)
									.map(([k, v]) => `${k}: ${Math.round((v as number) * 100)}%`)
									.join(", ") || "–"}
							</p>
						</div>
					</div>
				)}
			</div>

			<div className="px-4 pb-8">
				<SecondaryButton onClick={handleNewStart} className="w-full">
					{content["results.restartCta"]}
				</SecondaryButton>
			</div>
		</div>
	);
}
