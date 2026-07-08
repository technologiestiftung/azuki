import { strengthScorePoints } from "../strengthScoring";
import type { Occupation, UserProfile } from "../types";
import { scoreSingleInterestMatch } from "./interestMatching";
import {
	inferNotMatchPillIdFromText,
	NO_GO_TO_PILL_ID,
	occupationMatchesNotMatchPill,
	profilePrefersIndoors,
} from "./noGoPills";
import {
	NO_GO_MAP,
	occupationHasOutdoorWork,
	WORK_EXPECTATIONS_CHECKS,
	WORK_PREF_MAP,
} from "./predicates";
import { occupationMatchesStrength } from "./strengthMatching";
import { scoreCustomTextMatch } from "./textMatching";

export type MatchSignalKind = "match" | "notMatch";

export type MatchSignalDimension =
	| "interest"
	| "strength"
	| "subject"
	| "workPref"
	| "expectation"
	| "noGo"
	| "outdoorMismatch";

export interface MatchSignal {
	kind: MatchSignalKind;
	dimension: MatchSignalDimension;
	sourceId: string;
	weight: number;
	isCustom?: boolean;
}

export interface MatchSignalGroups {
	matching: MatchSignal[];
	notMatching: MatchSignal[];
}

function collectInterestSignals(
	profile: UserProfile,
	occupation: Occupation,
): MatchSignal[] {
	const signals: MatchSignal[] = [];
	const customInterestSet = new Set(profile.customInterests);

	for (const interestId of profile.interests) {
		const predefinedScore = scoreSingleInterestMatch(interestId, occupation);
		const score =
			predefinedScore > 0
				? predefinedScore
				: scoreCustomTextMatch(interestId, occupation);
		if (score <= 0) {
			continue;
		}
		signals.push({
			kind: "match",
			dimension: "interest",
			sourceId: interestId,
			weight: score,
			isCustom: customInterestSet.has(interestId),
		});
	}
	return signals;
}

function collectStrengthSignals(
	profile: UserProfile,
	occupation: Occupation,
): MatchSignal[] {
	const signals: MatchSignal[] = [];

	for (const [strengthId, value] of Object.entries(profile.strengths)) {
		const points = strengthScorePoints(value);
		if (points === 0 || !occupationMatchesStrength(strengthId, occupation)) {
			continue;
		}
		signals.push({
			kind: "match",
			dimension: "strength",
			sourceId: strengthId,
			weight: 2 + points,
		});
	}

	const customStrengthSet = new Set(profile.customStrengths);
	for (const strength of profile.selectedCustomStrengths) {
		if (!customStrengthSet.has(strength)) {
			continue;
		}
		const score = scoreCustomTextMatch(strength, occupation);
		if (score <= 0) {
			continue;
		}
		signals.push({
			kind: "match",
			dimension: "strength",
			sourceId: strength,
			weight: score,
			isCustom: true,
		});
	}

	return signals;
}

function collectSubjectSignals(
	profile: UserProfile,
	occupation: Occupation,
): MatchSignal[] {
	const signals: MatchSignal[] = [];
	const customSubjectSet = new Set(profile.customSubjects);

	for (const subjectId of profile.favoriteSubjects) {
		if (customSubjectSet.has(subjectId)) {
			const score = scoreCustomTextMatch(subjectId, occupation);
			if (score <= 0) {
				continue;
			}
			signals.push({
				kind: "match",
				dimension: "subject",
				sourceId: subjectId,
				weight: score,
				isCustom: true,
			});
			continue;
		}

		if (!occupation.subjects.includes(subjectId)) {
			continue;
		}
		signals.push({
			kind: "match",
			dimension: "subject",
			sourceId: subjectId,
			weight: 3,
		});
	}

	return signals;
}

function collectExpectationSignals(
	profile: UserProfile,
	occupation: Occupation,
): MatchSignal[] {
	const signals: MatchSignal[] = [];
	const customExpectationSet = new Set(profile.customWorkExpectations);

	for (const expectation of profile.workExpectations) {
		const check = WORK_EXPECTATIONS_CHECKS[expectation];
		if (!check?.(occupation)) {
			continue;
		}
		signals.push({
			kind: "match",
			dimension: "expectation",
			sourceId: expectation,
			weight: 2,
			isCustom: customExpectationSet.has(expectation),
		});
	}

	for (const expectation of profile.customWorkExpectations) {
		if (!profile.workExpectations.includes(expectation)) {
			continue;
		}
		const score = scoreCustomTextMatch(expectation, occupation);
		if (score <= 0) {
			continue;
		}
		signals.push({
			kind: "match",
			dimension: "expectation",
			sourceId: expectation,
			weight: score,
			isCustom: true,
		});
	}

	return signals;
}

function collectWorkPrefSignals(
	profile: UserProfile,
	occupation: Occupation,
): MatchSignal[] {
	const signals: MatchSignal[] = [];

	for (const [prefId, checks] of Object.entries(WORK_PREF_MAP)) {
		const choice = profile.workPreferences[prefId];
		if (!choice) {
			continue;
		}
		const check = choice === "a" ? checks.a : checks.b;
		if (!check(occupation)) {
			continue;
		}
		signals.push({
			kind: "match",
			dimension: "workPref",
			sourceId: `${prefId}:${choice}`,
			weight: 2,
		});
	}

	return signals;
}

function collectNoGoSignals(
	profile: UserProfile,
	occupation: Occupation,
): MatchSignal[] {
	const signals: MatchSignal[] = [];

	for (const [noGoId, pillId] of Object.entries(NO_GO_TO_PILL_ID)) {
		if (profile.noGos[noGoId] !== "rejected") {
			continue;
		}
		if (!NO_GO_MAP[noGoId]?.(occupation)) {
			continue;
		}
		signals.push({
			kind: "notMatch",
			dimension: "noGo",
			sourceId: pillId,
			weight: 3,
		});
	}

	if (profilePrefersIndoors(profile) && occupationHasOutdoorWork(occupation)) {
		signals.push({
			kind: "notMatch",
			dimension: "outdoorMismatch",
			sourceId: "natur",
			weight: 2,
		});
	}

	for (const noGo of profile.customNoGos) {
		if (profile.noGos[noGo] !== "rejected") {
			continue;
		}

		const themedPillId = inferNotMatchPillIdFromText(noGo);
		if (
			themedPillId &&
			occupationMatchesNotMatchPill(themedPillId, occupation)
		) {
			signals.push({
				kind: "notMatch",
				dimension: "noGo",
				sourceId: themedPillId,
				weight: 3,
			});
			continue;
		}

		const textMatchScore = scoreCustomTextMatch(noGo, occupation);
		if (textMatchScore <= 0) {
			continue;
		}

		signals.push({
			kind: "notMatch",
			dimension: "noGo",
			sourceId: noGo,
			weight: 2,
			isCustom: true,
		});
	}

	return signals;
}

export function collectMatchSignals(
	profile: UserProfile,
	occupation: Occupation,
): MatchSignalGroups {
	return {
		matching: [
			...collectInterestSignals(profile, occupation),
			...collectStrengthSignals(profile, occupation),
			...collectSubjectSignals(profile, occupation),
			...collectExpectationSignals(profile, occupation),
			...collectWorkPrefSignals(profile, occupation),
		],
		notMatching: collectNoGoSignals(profile, occupation),
	};
}
