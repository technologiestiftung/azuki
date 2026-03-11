import { useAppStore } from "../../store/useAppStore";
import { Step } from "../../common";
import { content } from "../../content/de";
import { PrimaryButton } from "../primitives/buttons/PrimaryButton";
import { Occupation } from "@azuki/shared";

export function ResultsScreen() {
	const matchResults = useAppStore((state) => state.matchResults);
	const profile = useAppStore((state) => state.profile);
	const goToStep = useAppStore((state) => state.goToStep);

	const occupations = matchResults?.occupations ?? [];

	const handleNewStart = () => {
		useAppStore.getState().resetProfile();
		goToStep(Step.Welcome);
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

			<div className="flex-1 px-4 pb-4 space-y-4 overflow-y-auto">
				{occupations.length > 0 ? (
					occupations.map((occupation: Occupation, index: number) => (
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
									.map(([k, v]) => `${k}: ${Math.round(v * 100)}%`)
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
