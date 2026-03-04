/**
 * Occupation–profile scoring engine.
 *
 * Each occupation is scored against a user profile across five dimensions:
 *
 *   1. Education — penalizes occupations where the user's degree level
 *      is underrepresented among current practitioners.
 *   2. No-gos — penalizes occupations whose working conditions match
 *      conditions the user has explicitly rejected (noise, dirt, etc.).
 *   3. Work preferences — rewards occupations matching the user's
 *      preferred work style (indoor/outdoor, hands-on/desk, pace, etc.).
 *   4. Subjects — rewards occupations linked to the user's favorite
 *      school subjects.
 *   5. Interests — maps hobbies to BERUFENET interest categories and
 *      rewards matches, weighted by the category's rank in the occupation.
 *
 * The combined score is used to pre-rank occupations before the LLM
 * re-ranking step in mistral/.
 */

import type { Occupation, UserProfile } from "@azuki/shared";

type OccupationPredicate = (occupation: Occupation) => boolean;
type WorkPreferenceOptionChecks = {
	a: OccupationPredicate;
	b: OccupationPredicate;
};

const NO_GO_MAP: Record<string, OccupationPredicate> = {
	noise: (o) => o.conditions.noise,
	dirt: (o) => o.conditions.dirt,
	"heavy-work": (o) => o.conditions.heavyLifting,
	computer: (o) => o.conditions.screenWork,
	"shift-work": (o) => o.conditions.shiftWork,
	animals: (o) => o.conditions.outdoor,
	danger: (o) => o.conditions.heights,
};

const WORK_PREF_MAP: Record<string, WorkPreferenceOptionChecks> = {
	location: {
		a: (o) => o.conditions.office || o.conditions.workshop,
		b: (o) => o.conditions.outdoor || o.conditions.constructionSite,
	},
	"hands-vs-mind": {
		a: (o) => o.conditions.manualLabor,
		b: (o) => o.conditions.screenWork || o.conditions.office,
	},
	variety: {
		a: () => false,
		b: () => false,
	},
	people: {
		a: (o) => !o.conditions.customerContact,
		b: (o) => o.conditions.customerContact,
	},
	pace: {
		a: (o) => o.conditions.office,
		b: () => false,
	},
	structure: {
		a: () => false,
		b: () => false,
	},
	purpose: {
		a: (o) => o.interests.includes("sozial-beratend"),
		b: () => false,
	},
	environment: {
		a: (o) => o.conditions.office || o.conditions.workshop,
		b: (o) => o.conditions.outdoor,
	},
};

const HOBBY_TO_INTEREST: Record<string, string[]> = {
	Gaming: ["theoretisch-abstrakt"],
	Computer: ["theoretisch-abstrakt"],
	Fotografieren: ["kreativ-gestaltend"],
	Videos: ["kreativ-gestaltend"],
	Zeichnen: ["kreativ-gestaltend"],
	Musik: ["kreativ-gestaltend"],
	Basteln: ["kreativ-gestaltend", "praktisch-konkret"],
	Schreiben: ["kreativ-gestaltend"],
	Bauen: ["praktisch-konkret"],
	Reparieren: ["praktisch-konkret"],
	Kochen: ["praktisch-konkret"],
	"Gärtnern": ["praktisch-konkret"],
	Tiere: ["praktisch-konkret"],
	Wandern: ["praktisch-konkret"],
	Natur: ["praktisch-konkret"],
	Sport: ["praktisch-konkret"],
	"Anderen helfen": ["sozial-beratend"],
	Organisieren: ["organisatorisch-pruefend"],
	Verkaufen: ["sozial-beratend"],
	"Kinder betreuen": ["sozial-beratend"],
};

export function scoreOccupation(
	occupation: Occupation,
	profile: UserProfile,
): number {
	let score = 0;

	score += scoreEducation(occupation, profile);
	score += scoreNoGos(occupation, profile);
	score += scoreWorkPreferences(occupation, profile);
	score += scoreSubjects(occupation, profile);
	score += scoreInterests(occupation, profile);

	return score;
}

function scoreEducation(
	occupation: Occupation,
	profile: UserProfile,
): number {
	if (!occupation.degreeStats || !profile.educationLevel) return 0;

	const stats = occupation.degreeStats;

	switch (profile.educationLevel) {
		case "secondary":
		case "extended_secondary":
			if (stats.secondary + stats.noQualification < 10) return -10;
			break;
		case "intermediate":
			if (stats.intermediate + stats.secondary + stats.noQualification < 10)
				return -5;
			break;
		case "none":
			if (stats.noQualification < 10) return -15;
			break;
		case "university_entrance":
			break;
	}

	return 0;
}

function scoreNoGos(occupation: Occupation, profile: UserProfile): number {
	let penalty = 0;
	for (const [id, answer] of Object.entries(profile.noGos)) {
		if (answer !== "rejected") continue;
		const check = NO_GO_MAP[id];
		if (check && check(occupation)) {
			penalty -= 5;
		}
	}
	return penalty;
}

function scoreWorkPreferences(
	occupation: Occupation,
	profile: UserProfile,
): number {
	let score = 0;
	for (const [id, choice] of Object.entries(profile.workPreferences)) {
		if (!choice) continue;
		const mapping = WORK_PREF_MAP[id];
		if (!mapping) continue;

		const selectedOptionCheck = choice === "a" ? mapping.a : mapping.b;
		if (selectedOptionCheck(occupation)) score += 2;
	}
	return score;
}

function scoreSubjects(
	occupation: Occupation,
	profile: UserProfile,
): number {
	let score = 0;
	for (const subject of profile.favoriteSubjects) {
		if (occupation.subjects.includes(subject)) {
			score += 1;
		}
	}
	return score;
}

function scoreInterests(
	occupation: Occupation,
	profile: UserProfile,
): number {
	let score = 0;

	const userCategories = new Set<string>();
	for (const interest of profile.interests) {
		const mappedCategories = HOBBY_TO_INTEREST[interest];
		if (mappedCategories) {
			for (const category of mappedCategories) userCategories.add(category);
		}
	}

	for (const cat of userCategories) {
		const interestIndex = occupation.interests.indexOf(cat);
		if (interestIndex === 0) score += 3;
		else if (interestIndex === 1) score += 2;
		else if (interestIndex >= 2) score += 1;
	}

	return score;
}
