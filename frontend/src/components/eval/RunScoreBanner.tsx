import type { Verdict } from "@azuki/shared";
import type { RunScore } from "./run-score";

interface Props {
	score: RunScore | undefined;
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

export function RunScoreBanner({ score }: Props) {
	if (!score) {
		return null;
	}
	const style = VERDICT_STYLES[score.verdict];
	return (
		<div
			className={`border rounded p-3 mb-4 flex items-baseline gap-3 ${style.bg} ${style.text}`}
		>
			<span className="text-base font-semibold">{style.label}</span>
			<span className="text-base">·</span>
			<span className="text-base font-semibold">{score.percent}%</span>
			<span className="text-sm text-gray-600">
				({score.passedCount} / {score.totalCount} criteria passed)
			</span>
		</div>
	);
}
