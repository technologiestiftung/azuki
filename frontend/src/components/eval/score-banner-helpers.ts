import type { ScoreReport, Verdict } from "@azuki/shared";

export interface VerdictStyle {
	bg: string;
	text: string;
	label: string;
}

const VERDICT_STYLES: Record<Verdict, VerdictStyle> = {
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

export function getVerdictStyle(verdict: Verdict): VerdictStyle {
	return VERDICT_STYLES[verdict];
}

export function isUnscorable(report: ScoreReport): boolean {
	return report.totalCount === 0;
}
