import type { To } from "react-router-dom";
import { Step } from "../common";
import { workPreferencePairs } from "../content/work-preference-pairs";
import { noGos } from "../components/competence-profile/steps/no-gos-step/no-gos";
import { strengths } from "../components/competence-profile/steps/strengths-step/strengths";

interface FlowNode {
	path: string;
	step?: Step;
	cardCount?: number;
}

/**
 * Screens in user journey order. Next/previous navigation follows this sequence.
 * Multi-card steps declare `cardCount` — the hash (#0, #1, …) tracks progress within them.
 */
const ORDERED_NAVIGATION_STEPS: FlowNode[] = [
	{ path: "/", step: Step.Login },
	{ path: "/welcome", step: Step.Welcome },
	{ path: "/start", step: Step.Start },
	{ path: "/education/inschool", step: Step.InSchool },
	{ path: "/education/degree", step: Step.SchoolDegreeStep },
	{ path: "/education/subjects", step: Step.SchoolSubjects },
	{ path: "/interests", step: Step.Interests },
	{ path: "/strengths", step: Step.Strengths, cardCount: strengths.length },
	{ path: "/conditions", step: Step.WorkValues },
	{ path: "/secret-talent", step: Step.SecretTalent },
	{ path: "/experience", step: Step.PracticalExperience },
	{
		path: "/expectations",
		step: Step.WorkPreferences,
		cardCount: workPreferencePairs.length,
	},
	{ path: "/nogos", step: Step.NoGos, cardCount: noGos.length },
	{ path: "/loading", step: Step.Loading },
	{ path: "/results/list", step: Step.Results },
];

const orderedStepIndexByPath = new Map(
	ORDERED_NAVIGATION_STEPS.map((node, index) => [node.path, index]),
);

export function parseHashCardIndex(hash: string): number {
	if (!hash || hash === "#") {
		return 0;
	}
	const hashMatch = /^#(\d+)$/.exec(hash);
	if (!hashMatch) {
		return 0;
	}
	return Math.max(0, parseInt(hashMatch[1], 10));
}

export function pathnameToStep(pathname: string): Step | undefined {
	if (pathname.startsWith("/results")) {
		return Step.Results;
	}
	const index = orderedStepIndexByPath.get(pathname);
	if (index === undefined) {
		return undefined;
	}
	return ORDERED_NAVIGATION_STEPS[index].step;
}

export function getNextPath(pathname: string, hash: string): To {
	const index = orderedStepIndexByPath.get(pathname);
	if (index === undefined) {
		return pathname;
	}

	const current = ORDERED_NAVIGATION_STEPS[index];
	if (current.cardCount) {
		const cardIndex = parseHashCardIndex(hash);
		if (cardIndex < current.cardCount - 1) {
			return { pathname, hash: `#${cardIndex + 1}` };
		}
	}

	const next = ORDERED_NAVIGATION_STEPS[index + 1];
	if (!next) {
		return pathname;
	}
	return next.cardCount ? { pathname: next.path, hash: "#0" } : next.path;
}

export function getPreviousPath(pathname: string, hash: string): To {
	if (pathname.startsWith("/results")) {
		return "/loading";
	}

	const index = orderedStepIndexByPath.get(pathname);
	if (index === undefined || index === 0) {
		return "/";
	}

	const current = ORDERED_NAVIGATION_STEPS[index];
	if (current.cardCount) {
		const cardIndex = parseHashCardIndex(hash);
		if (cardIndex > 0) {
			return { pathname, hash: `#${cardIndex - 1}` };
		}
	}

	const prev = ORDERED_NAVIGATION_STEPS[index - 1];
	if (prev.cardCount) {
		return { pathname: prev.path, hash: `#${Math.max(0, prev.cardCount - 1)}` };
	}
	return prev.path;
}
