import { useAppStore } from "../../store/useAppStore";
import { Step } from "../../common";
import { content } from "../../content/de";
import { PrimaryButton } from "../primitives/buttons/PrimaryButton";

export function ResultsScreen() {
	const matchResults = useAppStore((state) => state.matchResults);
	const profile = useAppStore((state) => state.profile);
	const goToStep = useAppStore((state) => state.goToStep);

	const berufe = matchResults?.berufe ?? [];

	return (
		<div className="flex flex-col min-h-[100dvh]">
			<div className="px-4 pt-6 pb-4">
				<h1 className="text-3xl font-bold">{content["results.title"]}</h1>
				<p className="text-base text-gray-500 mt-2">
					{berufe.length > 0
						? `Wir haben ${berufe.length} Ausbildungen gefunden, die zu dir passen.`
						: "Basierend auf deinem Profil haben wir passende Ausbildungen für dich gefunden."}
				</p>
			</div>

			<div className="flex-1 px-4 pb-4 space-y-4 overflow-y-auto">
				{berufe.length > 0 ? (
					berufe.map((beruf, index) => (
						<div
							key={beruf.id}
							className="bg-gray-50 rounded-3xl overflow-hidden"
						>
							{beruf.bilder[0]?.url && (
								<img
									src={beruf.bilder[0].url}
									alt={beruf.name}
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
									{beruf.name}
								</h3>
								<p className="text-sm text-gray-600 mb-3">
									{beruf.begruendung}
								</p>
								{beruf.aufgabenKompakt && (
									<p className="text-xs text-gray-500 line-clamp-3">
										{beruf.aufgabenKompakt}
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
								<strong>Schulabschluss:</strong> {profile.schulabschluss || "–"}
							</p>
							<p>
								<strong>Lieblingsfächer:</strong>{" "}
								{profile.lieblingsfaecher.join(", ") || "–"}
							</p>
							<p>
								<strong>Interessen:</strong>{" "}
								{profile.interessen.join(", ") || "–"}
							</p>
							<p>
								<strong>Stärken:</strong>{" "}
								{Object.entries(profile.staerken)
									.map(([k, v]) => `${k}: ${Math.round(v * 100)}%`)
									.join(", ") || "–"}
							</p>
						</div>
					</div>
				)}
			</div>

			<div className="px-4 pb-8">
				<PrimaryButton
					onClick={() => goToStep(Step.Welcome)}
					className="w-full"
				>
					{content["results.restartCta"]}
				</PrimaryButton>
			</div>
		</div>
	);
}
