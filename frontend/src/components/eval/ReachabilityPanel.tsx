import { useState } from "react";
import type { RubricReachability } from "./reachability";

interface Props {
	reachability: RubricReachability | undefined;
}

export function ReachabilityPanel({ reachability }: Props) {
	const [open, setOpen] = useState(false);

	if (!reachability || reachability.tierSTotal === 0) {
		return null;
	}

	const {
		prefilterSize,
		tierSTotal,
		tierSReached,
		tierSMissed,
		tierCInPrefilter,
	} = reachability;
	const reachedCount = tierSReached.length;
	const allReached = reachedCount === tierSTotal;
	const noTierC = tierCInPrefilter.length === 0;

	let summaryColor: string;
	if (allReached && noTierC) {
		summaryColor = "text-emerald-700";
	} else if (allReached) {
		summaryColor = "text-amber-700";
	} else {
		summaryColor = "text-red-700";
	}

	return (
		<div className="text-xs mb-2">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className={`flex items-center gap-2 ${summaryColor}`}
				aria-expanded={open}
			>
				<span>{open ? "▾" : "▸"}</span>
				<span>
					Pre-filter reachability:{" "}
					<span className="font-medium">
						Tier S {reachedCount}/{tierSTotal}
					</span>
					{tierCInPrefilter.length > 0 && (
						<>
							{" · "}
							<span className="text-red-700">
								{tierCInPrefilter.length} Tier C in top {prefilterSize}
							</span>
						</>
					)}
				</span>
			</button>

			{open && (
				<div className="mt-1 ml-4 space-y-2">
					<div>
						<div className="text-sky-shade-160 mb-0.5">
							Tier S in pre-filter:
						</div>
						<ul className="space-y-0.5">
							{tierSReached.map((e) => (
								<li key={`s-r-${e.id}`} className="flex gap-2">
									<span className="text-emerald-700">✓</span>
									<span className="flex-1">{e.name}</span>
									<span className="text-sky-shade-110">rank {e.rank}</span>
								</li>
							))}
							{tierSMissed.map((e) => (
								<li key={`s-m-${e.id}`} className="flex gap-2">
									<span className="text-red-700">✗</span>
									<span className="flex-1 text-sky-shade-110">{e.name}</span>
									<span className="text-sky-shade-110">
										not in top {prefilterSize}
									</span>
								</li>
							))}
						</ul>
					</div>

					{tierCInPrefilter.length > 0 && (
						<div>
							<div className="text-sky-shade-160 mb-0.5">
								Tier C in pre-filter:
							</div>
							<ul className="space-y-0.5">
								{tierCInPrefilter.map((e) => (
									<li key={`c-${e.id}`} className="flex gap-2">
										<span className="text-red-700">⚠</span>
										<span className="flex-1">{e.name}</span>
										<span className="text-sky-shade-110">rank {e.rank}</span>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
