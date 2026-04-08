import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { matchProfile } from "../../api/client";
import { content } from "../../content/de";
import { PrimaryButton } from "../primitives/buttons/PrimaryButton";
import { type MatchedOccupation, AI_MODELS, DEFAULT_MODEL_ID } from "@azuki/shared";

export function ResultsPage() {
	const navigate = useNavigate();
	const matchResults = useAppStore((state) => state.matchResults);
	const profile = useAppStore((state) => state.profile);
	const selectedModel = useAppStore((state) => state.selectedModel);
	const setSelectedModel = useAppStore((state) => state.setSelectedModel);
	const setMatchResults = useAppStore((state) => state.setMatchResults);
	const generation = matchResults?.generation;
	const [isRerunning, setIsRerunning] = useState(false);

	const occupations = matchResults?.occupations ?? [];

	const handleRerun = async () => {
		setIsRerunning(true);
		try {
			const result = await matchProfile(profile, selectedModel ?? undefined);
			setMatchResults(result);
		} catch (err) {
			console.error("Re-run failed:", err);
		} finally {
			setIsRerunning(false);
		}
	};

	const handleNewStart = () => {
		useAppStore.getState().resetProfile();
		navigate("/welcome");
	};

	return (
		<div className="flex flex-col h-full">
			<div className="px-4 pt-6 pb-4">
				<h1 className="text-3xl font-bold">{content["results.title"]}</h1>
				<p className="text-base text-gray-500 mt-2">
					{occupations.length > 0
						? `Wir haben ${occupations.length} Ausbildungen gefunden, die zu dir passen.`
						: "Basierend auf deinem Profil haben wir passende Ausbildungen für dich gefunden."}
				</p>
			</div>

			<div className="mx-4 mb-3 p-3 bg-gray-100 rounded-2xl text-xs space-y-2">
				<div className="flex items-center gap-2">
					<span className="font-semibold text-gray-500">Model:</span>
					<select
						value={selectedModel ?? DEFAULT_MODEL_ID}
						onChange={(e) => setSelectedModel(e.target.value)}
						className="bg-white text-xs rounded px-2 py-1 border border-gray-300 flex-1"
					>
						{AI_MODELS.map((m) => (
							<option key={m.id} value={m.id}>
								{m.label}
							</option>
						))}
					</select>
					<button
						onClick={handleRerun}
						disabled={isRerunning}
						className="bg-sky-500 text-white text-xs font-medium rounded px-3 py-1 disabled:opacity-50"
					>
						{isRerunning ? "Running..." : "Re-run"}
					</button>
				</div>
				{generation && (
					<div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-500">
						<span>
							Used: <span className="text-gray-700 font-medium">{generation.model}</span>
						</span>
						<span>
							Cost: <span className="text-green-600 font-medium">${generation.cost.toFixed(4)}</span>
						</span>
						<span>
							In: <span className="text-gray-700">{generation.tokensInput.toLocaleString()}</span>
						</span>
						<span>
							Out: <span className="text-gray-700">{generation.tokensOutput.toLocaleString()}</span>
						</span>
					</div>
				)}
			</div>

			<div className="flex-1 px-4 pb-4 space-y-4 overflow-y-auto">
				{occupations.length > 0 ? (
					occupations.map((occupation: MatchedOccupation, index: number) => (
						<div
							key={occupation.id}
							className="bg-gray-50 rounded-3xl overflow-hidden"
						>
							{occupation.images[0]?.url && (
								<img
									src={occupation.images[0].url}
									alt={occupation.name}
									className="w-full h-40 object-cover"
								/>
							)}
							<div className="p-4">
								<div className="flex items-center gap-2 mb-1">
									<span className="text-sm font-semibold text-gray-400">
										#{index + 1}
									</span>
								</div>
								<h3 className="text-lg leading-6 font-bold mb-2">
									{occupation.name}
								</h3>
								<p className="text-sm text-gray-600 mb-3">
									{occupation.reasoning}
								</p>
								{occupation.taskSummary && (
									<p className="text-xs text-gray-500 line-clamp-3">
										{occupation.taskSummary}
									</p>
								)}
							</div>
						</div>
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
				<PrimaryButton onClick={handleNewStart} className="w-full">
					{content["results.restartCta"]}
				</PrimaryButton>
			</div>
		</div>
	);
}
