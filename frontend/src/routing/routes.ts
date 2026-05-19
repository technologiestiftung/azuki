import type { To } from "react-router-dom";
import { Step } from "../common";
import { workPreferencePairs } from "../content/work-preference-pairs";
import { noGos } from "../components/competence-profile/steps/no-gos-step/no-gos";
import { strengths } from "../components/competence-profile/steps/strengths-step/strengths";

export const ROUTE_PATHS = {
	login: "/",
	welcome: "/welcome",
	start: "/start",
	educationInSchool: "/education/inschool",
	educationDegree: "/education/degree",
	educationSubjects: "/education/subjects",
	interests: "/interests",
	strengths: "/strengths",
	expectations: "/expectations",
	secretTalent: "/secret-talent",
	experience: "/experience",
	preferences: "/preferences",
	nogos: "/nogos",
	loading: "/loading",
	resultsList: "/results/list",
	eval: "/eval",
	personas: "/personas",
	personaDetail: "/personas/:id",
} as const;

export const RESULTS_PATH_PREFIX = "/results" as const;

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
	{ path: ROUTE_PATHS.login, step: Step.Login },
	{ path: ROUTE_PATHS.welcome, step: Step.Welcome },
	{ path: ROUTE_PATHS.start, step: Step.Start },
	{ path: ROUTE_PATHS.educationInSchool, step: Step.InSchool },
	{ path: ROUTE_PATHS.educationDegree, step: Step.SchoolDegreeStep },
	{ path: ROUTE_PATHS.educationSubjects, step: Step.SchoolSubjects },
	{ path: ROUTE_PATHS.interests, step: Step.Interests },
	{
		path: ROUTE_PATHS.strengths,
		step: Step.Strengths,
		cardCount: strengths.length,
	},
	{ path: ROUTE_PATHS.expectations, step: Step.WorkExpectations },
	{ path: ROUTE_PATHS.secretTalent, step: Step.SecretTalent },
	{ path: ROUTE_PATHS.experience, step: Step.PracticalExperience },
	{
		path: ROUTE_PATHS.preferences,
		step: Step.WorkPreferences,
		cardCount: workPreferencePairs.length,
	},
	{ path: ROUTE_PATHS.nogos, step: Step.NoGos, cardCount: noGos.length },
	{ path: ROUTE_PATHS.loading, step: Step.Loading },
	{ path: ROUTE_PATHS.resultsList, step: Step.Results },
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
	if (pathname.startsWith(RESULTS_PATH_PREFIX)) {
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
	if (pathname.startsWith(RESULTS_PATH_PREFIX)) {
		return {
			pathname: ROUTE_PATHS.nogos,
			hash: `#${Math.max(0, noGos.length - 1)}`,
		};
	}

	const index = orderedStepIndexByPath.get(pathname);
	if (index === undefined || index === 0) {
		return ROUTE_PATHS.login;
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
