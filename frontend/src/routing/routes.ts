import type { To } from "react-router-dom";
import { QUESTIONNAIRE_STEPS, Step } from "../common";
import { workPreferencePairs } from "../content/work-preference-pairs";
import { NO_GO_STEP_CARD_COUNT } from "../components/competence-profile/steps/no-gos-step/no-gos";
import { STRENGTH_STEP_CARD_COUNT } from "../components/competence-profile/steps/strengths-step/strengths";

export const ROUTE_PATHS = {
	root: "/",
	start: "/start",
	educationInSchool: "/education/inschool",
	educationDegree: "/education/degree",
	educationSubjects: "/education/subjects",
	interests: "/interests",
	preferredJob: "/preferred-job",
	strengths: "/strengths",
	expectations: "/expectations",
	experience: "/experience",
	preferences: "/preferences",
	nogos: "/nogos",
	loading: "/loading",
	resultsOccupationDetail: "/results/:id",
	resultsList: "/results/apprenticeships",
	resultsVacancies: "/results/vacancies",
	resultsVacancyDetail: "/results/vacancies/:refnr",
	eval: "/eval",
	personas: "/personas",
	personaDetail: "/personas/:id",
	profile: "/profile",
	about: "/about",
} as const;

export const RESULTS_PATH_PREFIX = "/results" as const;

export function buildResultsOccupationPath(
	id: number,
	options?: { wildcard?: boolean },
): string {
	return options?.wildcard ? `/results/${id}?wildcard=1` : `/results/${id}`;
}

export function buildResultsVacancyDetailPath(referenznummer: string): string {
	return `/results/vacancies/${encodeURIComponent(referenznummer)}`;
}

export function isVacanciesSectionPath(pathname: string): boolean {
	return (
		pathname === ROUTE_PATHS.resultsVacancies ||
		pathname.startsWith(`${ROUTE_PATHS.resultsVacancies}/`)
	);
}

export function isOccupationDetailPath(pathname: string): boolean {
	return /^\/results\/\d+$/.test(pathname);
}

export function isResultsSectionPath(pathname: string): boolean {
	return (
		pathname === ROUTE_PATHS.resultsList || isOccupationDetailPath(pathname)
	);
}

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
	{ path: ROUTE_PATHS.start, step: Step.Start },
	{ path: ROUTE_PATHS.educationInSchool, step: Step.InSchool },
	{ path: ROUTE_PATHS.educationDegree, step: Step.SchoolDegreeStep },
	{ path: ROUTE_PATHS.educationSubjects, step: Step.SchoolSubjects },
	{ path: ROUTE_PATHS.interests, step: Step.Interests },
	{ path: ROUTE_PATHS.preferredJob, step: Step.PreferredJob },
	{
		path: ROUTE_PATHS.strengths,
		step: Step.Strengths,
		cardCount: STRENGTH_STEP_CARD_COUNT,
	},
	{ path: ROUTE_PATHS.expectations, step: Step.WorkExpectations },
	{ path: ROUTE_PATHS.experience, step: Step.PracticalExperience },
	{
		path: ROUTE_PATHS.preferences,
		step: Step.WorkPreferences,
		cardCount: workPreferencePairs.length,
	},
	{
		path: ROUTE_PATHS.nogos,
		step: Step.NoGos,
		cardCount: NO_GO_STEP_CARD_COUNT,
	},
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

const QUESTIONNAIRE_FLOW_NODES = ORDERED_NAVIGATION_STEPS.filter(
	(node) => node.step !== undefined && QUESTIONNAIRE_STEPS.includes(node.step),
);

/**
 * Granular progress across questionnaire screens, counting hash cards
 * within multi-card steps (Strengths, WorkPreferences, NoGos).
 */
export function getGranularProgress(pathname: string, hash: string): number {
	const nodeIndex = QUESTIONNAIRE_FLOW_NODES.findIndex(
		(node) => node.path === pathname,
	);
	if (nodeIndex === -1) {
		return 0;
	}

	const total = QUESTIONNAIRE_FLOW_NODES.reduce(
		(sum, node) => sum + (node.cardCount ?? 1),
		0,
	);

	let current = 0;
	for (let i = 0; i < nodeIndex; i++) {
		current += QUESTIONNAIRE_FLOW_NODES[i].cardCount ?? 1;
	}
	current += parseHashCardIndex(hash) + 1;

	return current / total;
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
			hash: `#${Math.max(0, NO_GO_STEP_CARD_COUNT - 1)}`,
		};
	}

	const index = orderedStepIndexByPath.get(pathname);
	if (index === undefined) {
		return ROUTE_PATHS.start;
	}
	if (index === 0) {
		return pathname;
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
