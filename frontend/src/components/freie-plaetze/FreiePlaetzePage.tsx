import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import { Step } from "../../common";
import { content } from "../../content/de";
import { PrimaryButton } from "../primitives/buttons/PrimaryButton";
import { SecondaryButton } from "../primitives/buttons/SecondaryButton";
import { fetchAusbildungsplaetze } from "../../api/client";
import type { AusbildungsplatzResult } from "@azuki/shared";

const RADIUS_OPTIONS = [10, 25, 50, 100] as const;

function SearchForm({
	plz,
	umkreis,
	onPlzChange,
	onUmkreisChange,
	onSearch,
	hasSearched,
}: {
	plz: string;
	umkreis: number;
	onPlzChange: (value: string) => void;
	onUmkreisChange: (km: number) => void;
	onSearch: () => void;
	hasSearched: boolean;
}) {
	const isValid = /^\d{5}$/.test(plz);

	return (
		<div className="space-y-4">
			<label className="block text-sm font-medium text-gray-700">
				{content["freiePlaetze.plzLabel"]}
			</label>
			<input
				type="text"
				inputMode="numeric"
				maxLength={5}
				value={plz}
				onChange={(e) => onPlzChange(e.target.value.replace(/\D/g, ""))}
				onKeyDown={(e) => e.key === "Enter" && isValid && onSearch()}
				placeholder={content["freiePlaetze.plzPlaceholder"]}
				className="w-full h-12 px-4 text-lg font-medium rounded-2xl border-2 border-gray-600 focus:outline-none focus:border-gray-800 focus:ring-2 focus:ring-sky-300"
			/>
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					{content["freiePlaetze.radiusLabel"]}
				</label>
				<div className="flex gap-2">
					{RADIUS_OPTIONS.map((km) => (
						<button
							key={km}
							type="button"
							onClick={() => onUmkreisChange(km)}
							className={`flex-1 h-10 rounded-xl text-sm font-medium transition-colors ${
								umkreis === km
									? "bg-gray-900 text-white"
									: "bg-gray-100 text-gray-600 hover:bg-gray-200"
							}`}
						>
							{km} km
						</button>
					))}
				</div>
			</div>
			{!hasSearched && (
				<PrimaryButton onClick={onSearch} disabled={!isValid} className="w-full">
					{content["freiePlaetze.searchCta"]}
				</PrimaryButton>
			)}
		</div>
	);
}

function BerufResult({ result }: { result: AusbildungsplatzResult }) {
	const hasResults = result.totalCount > 0;

	return (
		<div className="bg-gray-50 rounded-3xl p-4">
			<div className="flex items-baseline justify-between mb-2">
				<h3 className="text-lg font-bold leading-6">{result.beruf}</h3>
				{hasResults && (
					<span className="text-sm text-gray-500 shrink-0 ml-2">
						{result.totalCount} {content["freiePlaetze.resultCount"]}
					</span>
				)}
			</div>
			{hasResults ? (
				<>
					<ul className="space-y-1 mb-3">
						{result.previews.map((preview, i) => (
							<li key={i} className="text-sm text-gray-600">
								{preview.employer} — {preview.city}
							</li>
						))}
					</ul>
					<a
						href={result.searchUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm font-medium text-sky-600 hover:text-sky-700"
					>
						{content["freiePlaetze.showAll"]} →
					</a>
				</>
			) : (
				<p className="text-sm text-gray-400">
					{content["freiePlaetze.noResults"]}
				</p>
			)}
		</div>
	);
}

export function FreiePlaetzePage() {
	const matchResults = useAppStore((state) => state.matchResults);
	const ausbildungsplaetze = useAppStore((state) => state.ausbildungsplaetze);
	const setAusbildungsplaetze = useAppStore((state) => state.setAusbildungsplaetze);
	const goToStep = useAppStore((state) => state.goToStep);

	const [plz, setPlz] = useState("");
	const [umkreis, setUmkreis] = useState(25);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const berufe = matchResults?.occupations.map((o) => o.name) ?? [];
	const hasSearched = ausbildungsplaetze !== null;
	const isValidPlz = /^\d{5}$/.test(plz);

	const doSearch = async (searchPlz: string, searchUmkreis: number) => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetchAusbildungsplaetze(searchPlz, berufe, searchUmkreis);
			setAusbildungsplaetze(response);
		} catch {
			setError("Die Suche ist leider fehlgeschlagen. Bitte versuche es erneut.");
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = () => {
		if (isValidPlz) {
			doSearch(plz, umkreis);
		}
	};

	const handleUmkreisChange = (km: number) => {
		setUmkreis(km);
		if (isValidPlz && hasSearched) {
			doSearch(plz, km);
		}
	};

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[100dvh] px-8">
				<div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-sky-300 mb-8 animate-spin" />
				<h2 className="text-2xl font-semibold text-center">
					{content["freiePlaetze.loadingTitle"]}
				</h2>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full">
			<div className="px-4 pt-6 pb-4">
				<h1 className="text-3xl font-bold">{content["freiePlaetze.title"]}</h1>
				<p className="text-base text-gray-500 mt-2">
					{content["freiePlaetze.subtitle"]}
				</p>
			</div>

			<div className="flex-1 px-4 pb-4 space-y-4 overflow-y-auto">
				<SearchForm
					plz={plz}
					umkreis={umkreis}
					onPlzChange={setPlz}
					onUmkreisChange={handleUmkreisChange}
					onSearch={handleSearch}
					hasSearched={hasSearched}
				/>

				{error && (
					<p className="text-sm text-red-500 text-center">{error}</p>
				)}

				{ausbildungsplaetze && (
					<div className="space-y-3 pt-2">
						{ausbildungsplaetze.results.map((result) => (
							<BerufResult key={result.beruf} result={result} />
						))}
					</div>
				)}
			</div>

			<div className="px-4 pb-8">
				<SecondaryButton onClick={() => goToStep(Step.Results)} className="w-full">
					{content["freiePlaetze.backCta"]}
				</SecondaryButton>
			</div>
		</div>
	);
}
