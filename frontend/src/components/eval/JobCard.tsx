import type { FinalEntry } from "@azuki/shared";
import type { RubricTier } from "./tier-lookup";

interface Props {
	entry: FinalEntry;
	rank: number;
	tier: RubricTier | undefined;
}

const TIER_BORDER: Record<RubricTier, string> = {
	S: "border-emerald-500",
	A: "border-amber-400",
	C: "border-red-400",
};

const TIER_BADGE: Record<RubricTier, string> = {
	S: "bg-emerald-100 text-emerald-800",
	A: "bg-amber-100 text-amber-800",
	C: "bg-red-100 text-red-800",
};

export function JobCard({ entry, rank, tier }: Props) {
	const borderClass = tier ? TIER_BORDER[tier] : "border-sky-shade-20";

	return (
		<div className={`p-2 border-l-2 ${borderClass}`}>
			<div className="flex items-baseline gap-2">
				<span className="text-xs text-sky-shade-110 w-5">{rank}.</span>
				<span className="font-medium text-sm flex-1">{entry.name}</span>
				<span className="text-xs text-sky-shade-110">
					{entry.score.toFixed(2)}
				</span>
				{tier && (
					<span
						className={`text-[10px] font-semibold px-1.5 rounded ${TIER_BADGE[tier]}`}
					>
						{tier}
					</span>
				)}
			</div>
			{entry.reasoning && (
				<div className="text-xs text-sky-shade-170 mt-1 whitespace-pre-wrap">
					{entry.reasoning}
				</div>
			)}
		</div>
	);
}
