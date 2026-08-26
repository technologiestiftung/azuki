import { useState } from "react";
import type { ScoreReport, Verdict } from "@azuki/shared";

interface Props {
	report: ScoreReport | undefined;
}

const VERDICT_STYLES: Record<
	Verdict,
	{ bg: string; text: string; label: string }
> = {
	"strong-pass": {
		bg: "bg-emerald-50 border-emerald-300",
		text: "text-emerald-800",
		label: "STRONG PASS",
	},
	pass: {
		bg: "bg-green-50 border-green-300",
		text: "text-green-800",
		label: "PASS",
	},
	concerns: {
		bg: "bg-amber-50 border-amber-300",
		text: "text-amber-800",
		label: "CONCERNS",
	},
	fail: {
		bg: "bg-red-50 border-red-300",
		text: "text-red-800",
		label: "FAIL",
	},
};

export function ScoreBanner({ report }: Props) {
	const [open, setOpen] = useState(false);

	if (!report) {
		return (
			<div className="border rounded p-2 mb-2 text-xs text-gray-500 bg-gray-50 border-sky-shade-20">
				Score unavailable
			</div>
		);
	}

	const style = VERDICT_STYLES[report.verdict];

	if (report.hasError) {
		return (
			<div
				className={`border rounded p-2 mb-2 text-xs ${style.bg} ${style.text}`}
			>
				FAIL · result error
			</div>
		);
	}

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
					{report.percent}% <span className="ml-1">{open ? "▾" : "▸"}</span>
				</span>
			</button>
			{open && (
				<ul className="border-t border-current/10 px-2 py-1 space-y-1 text-xs">
					<li className="flex gap-2">
						<span className="text-emerald-700">●</span>
						<span className="flex-1">Tier S im Top 8</span>
						<span className="font-medium">{report.tierSCount}</span>
					</li>
					<li className="flex gap-2">
						<span className="text-amber-700">●</span>
						<span className="flex-1">Tier A im Top 8</span>
						<span className="font-medium">{report.tierACount}</span>
					</li>
					<li className="flex gap-2">
						<span className="text-red-700">●</span>
						<span className="flex-1">Tier C im Top 8</span>
						<span className="font-medium">{report.tierCCount}</span>
					</li>
				</ul>
			)}
		</div>
	);
}
