/** Pill ids from PracticalExperienceStep — keep in sync with the UI suggestion pills. */
export const PRACTICAL_EXPERIENCE_CATEGORY_IDS = [
	"home-help",
	"school",
	"friends",
	"club",
	"internship",
	"job",
] as const;

export type PracticalExperienceCategoryId =
	(typeof PRACTICAL_EXPERIENCE_CATEGORY_IDS)[number];

/** Category signal strength for prefilter scoring (internship/job strongest). */
export const PRACTICAL_EXPERIENCE_CATEGORY_WEIGHT: Record<
	PracticalExperienceCategoryId,
	number
> = {
	internship: 1,
	job: 1,
	school: 0.65,
	club: 0.65,
	"home-help": 0.35,
	friends: 0.35,
};

export const PRACTICAL_EXPERIENCE_DEFAULT_CATEGORY_WEIGHT = 0.5;

const PRACTICAL_EXPERIENCE_CATEGORY_ID_SET = new Set<string>(
	PRACTICAL_EXPERIENCE_CATEGORY_IDS,
);

export function getPracticalExperienceCategoryWeight(
	selectedExperienceId: string | null,
): number {
	if (
		selectedExperienceId &&
		PRACTICAL_EXPERIENCE_CATEGORY_ID_SET.has(selectedExperienceId)
	) {
		return PRACTICAL_EXPERIENCE_CATEGORY_WEIGHT[
			selectedExperienceId as PracticalExperienceCategoryId
		];
	}
	return PRACTICAL_EXPERIENCE_DEFAULT_CATEGORY_WEIGHT;
}

/** 1–5 star rating → multiplier (3★ = neutral, matching the rating sheet). */
export const PRACTICAL_EXPERIENCE_RATING_MULTIPLIER: Record<number, number> = {
	5: 1,
	4: 0.85,
	3: 0,
	2: 0.25,
	1: 0.1,
};

export const PRACTICAL_EXPERIENCE_POINT_PER_HIT = 2;
export const PRACTICAL_EXPERIENCE_SCORE_CAP = 8;
export const PRACTICAL_EXPERIENCE_KEYWORD_HIT_CAP = 3;

export interface PracticalExperienceEntry {
	id: string;
	description: string;
	selectedExperienceId: string | null;
	selectedExperienceLabel: string | null;
	rating: number;
}

export function getActivePracticalExperiences(
	experiences: PracticalExperienceEntry[],
	selectedIds: string[],
): PracticalExperienceEntry[] {
	const selectedIdSet = new Set(selectedIds);
	return experiences.filter((entry) => selectedIdSet.has(entry.id));
}

export function formatPracticalExperiencesForApi(
	experiences: PracticalExperienceEntry[],
	selectedIds?: string[],
): string {
	const activeExperiences = selectedIds
		? getActivePracticalExperiences(experiences, selectedIds)
		: experiences;

	if (activeExperiences.length === 0) {
		return "";
	}

	return activeExperiences
		.map((entry) => {
			const parts = [entry.description];
			if (entry.rating > 0) {
				parts.push(`Bewertung: ${entry.rating}/5`);
			}
			return parts.join(" – ");
		})
		.join("; ");
}
