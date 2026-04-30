import { useState } from "react";
import type { ScoreReport } from "@azuki/shared";
import { getVerdictStyle, isUnscorable } from "./score-banner-helpers";

interface Props {
	report: ScoreReport | undefined;
}

export function ScoreBanner({ report }: Props) {
	const [open, setOpen] = useState(false);

	if (!report || isUnscorable(report)) {
		return (
			<div className="border rounded p-2 mb-2 text-xs text-gray-500 bg-gray-50 border-gray-200">
				Score unavailable
			</div>
		);
	}

	const style = getVerdictStyle(report.verdict);

	return (
		<div className={`border rounded mb-2 ${style.bg}`}>
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className={`w-full flex items-center justify-between p-2 text-left ${style.text}`}
				aria-expanded={open}
			>
				<span className="text-sm font-semibold">{style.label}</span>
				<span className="text-xs">
					{report.passedCount} / {report.totalCount} criteria{" "}
					<span className="ml-1">{open ? "▾" : "▸"}</span>
				</span>
			</button>
			{open && (
				<ul className="border-t border-current/10 px-2 py-1 space-y-1">
					{report.criteria.map((c, i) => (
						<li key={`${c.name}-${i}`} className="text-xs flex gap-2">
							<span className={c.passed ? "text-green-700" : "text-red-700"}>
								{c.passed ? "✓" : "✗"}
							</span>
							<div className="flex-1">
								<div className="font-medium text-gray-800">
									{c.name}
									{c.hardFail && (
										<span className="ml-1 text-red-700 text-[10px] uppercase">
											hard fail
										</span>
									)}
								</div>
								<div className="text-gray-600">{c.details}</div>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
