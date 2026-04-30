import { useState } from "react";
import type {
	PersonaId,
	PersonaResult,
	ScoreReport,
	UserProfile,
} from "@azuki/shared";
import { PERSONAS, RUBRICS } from "@azuki/shared";
import type { RubricReachability } from "./reachability";
import { JobCard } from "./JobCard";
import { ScoreBanner } from "./ScoreBanner";
import { ReachabilityPanel } from "./ReachabilityPanel";
import { getRubricTier, type RubricTier } from "./tier-lookup";

interface Props {
	personaId: PersonaId;
	current: PersonaResult | undefined;
	report: ScoreReport | undefined;
	reachability: RubricReachability | undefined;
	onRetry: () => void;
}

const PREFILTER_TIER_BORDER: Record<RubricTier, string> = {
	S: "border-emerald-500",
	A: "border-amber-400",
	C: "border-red-400",
};

const PREFILTER_TIER_BADGE: Record<RubricTier, string> = {
	S: "bg-emerald-100 text-emerald-800",
	A: "bg-amber-100 text-amber-800",
	C: "bg-red-100 text-red-800",
};

function PersonaHeader({
	id,
	profile,
}: {
	id: PersonaId;
	profile: UserProfile;
}) {
	const summary = [
		profile.educationLevel ?? "—",
		profile.inSchool ? "in Schule" : "nicht in Schule",
		`${profile.favoriteSubjects.length} Fächer`,
		`${profile.interests.length} Interessen`,
	].join(" · ");
	return (
		<div className="border-b border-gray-200 pb-2 mb-2">
			<div className="font-semibold capitalize">{id}</div>
			<div className="text-xs text-gray-600">{summary}</div>
			<div
				className="text-xs text-gray-500 mt-1 truncate"
				title={profile.practicalExperience}
			>
				{profile.practicalExperience.slice(0, 60)}
				{profile.practicalExperience.length > 60 ? "…" : ""}
			</div>
		</div>
	);
}

export function PersonaColumn({
	personaId,
	current,
	report,
	reachability,
	onRetry,
}: Props) {
	const [showPrefilter, setShowPrefilter] = useState(false);
	const profile = PERSONAS[personaId];
	const rubric = RUBRICS[personaId];
	const isSuccess = current && !("error" in current);

	return (
		<div className="flex-1 min-w-0 border border-gray-200 rounded p-3">
			<ScoreBanner report={report} />
			<PersonaHeader id={personaId} profile={profile} />

			{!current && <div className="text-sm text-gray-500">No run yet.</div>}

			{current && "error" in current && (
				<div className="text-sm">
					<div className="text-red-700 mb-2">Error: {current.error}</div>
					<button
						type="button"
						onClick={onRetry}
						className="border border-gray-400 px-3 py-1 rounded text-xs"
					>
						Retry
					</button>
				</div>
			)}

			{isSuccess && (
				<>
					<div className="space-y-1">
						{current.final.map((entry, i) => (
							<JobCard
								key={entry.id}
								entry={entry}
								rank={i + 1}
								tier={getRubricTier(entry.id, rubric)}
							/>
						))}
					</div>

					<div className="mt-3">
						<ReachabilityPanel reachability={reachability} />
					</div>

					<button
						type="button"
						onClick={() => setShowPrefilter((s) => !s)}
						className="text-xs text-blue-600 underline"
					>
						{showPrefilter ? "▾" : "▸"} Pre-filter top{" "}
						{current.prefilter.length}
					</button>
					{showPrefilter && (
						<div className="mt-2 space-y-1 text-xs">
							{current.prefilter.map((entry, i) => {
								const tier = getRubricTier(entry.id, rubric);
								const borderClass = tier
									? PREFILTER_TIER_BORDER[tier]
									: "border-gray-200";
								return (
									<div
										key={entry.id}
										className={`flex gap-2 border-l-2 pl-2 ${borderClass}`}
									>
										<span className="text-gray-500 w-6">{i + 1}.</span>
										<span className="flex-1 truncate">{entry.name}</span>
										<span className="text-gray-500">
											{entry.score.toFixed(2)}
										</span>
										{tier && (
											<span
												className={`text-[10px] font-semibold px-1.5 rounded ${PREFILTER_TIER_BADGE[tier]}`}
											>
												{tier}
											</span>
										)}
									</div>
								);
							})}
						</div>
					)}
				</>
			)}
		</div>
	);
}
