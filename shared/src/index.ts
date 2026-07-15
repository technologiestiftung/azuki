export type {
	WorkConditions,
	DegreeDistribution,
	AccessLevel,
	OccupationImage,
	Occupation,
	EducationLevel,
	NoGoAnswer,
	WorkPreferenceChoice,
	UserProfile,
	MatchedOccupation,
	MatchResult,
	GenerationInfo,
	VacancyPreview,
	VacancyResult,
	VacanciesResponse,
} from "./types";

export {
	AI_MODELS,
	AI_MODEL_IDS,
	DEFAULT_MODEL_ID,
	type AiModel,
} from "./models";

export { SUBJECTS, type SubjectDefinition } from "./subjects";

export { INTERESTS, type InterestDefinition } from "./interests";

export type {
	PrefilterEntry,
	FinalEntry,
	PersonaResult,
	EvalSnapshot,
} from "./eval-types";

export {
	POPULARITY_INDEX,
	getPopularityTier,
	getPopularityRecord,
	type PopularityTier,
	type OccupationCategory,
	type DazubiMatchType,
	type PopularityRecord,
} from "./popularity";

export {
	EVAL_TOP_N,
	EVAL_MAX_POINTS,
	EVAL_POINTS_TIER_S,
	EVAL_POINTS_TIER_A,
	EVAL_VERDICT_CONCERNS_BELOW,
	EVAL_VERDICT_FAIL_BELOW,
	EVAL_VERDICT_PASS_BELOW,
} from "./eval-rubrics/scoring";
export { type Verdict, type ScoreReport } from "./eval-rubrics/types";

export type { Persona } from "./persona";

export { formatOccupationDisplayName } from "./occupationDisplayName";

export { strengthScorePoints } from "./strengthScoring";
export type {
	PracticalExperienceEntry,
	PracticalExperienceCategoryId,
} from "./practicalExperience";
export {
	PRACTICAL_EXPERIENCE_CATEGORY_IDS,
	PRACTICAL_EXPERIENCE_CATEGORY_WEIGHT,
	PRACTICAL_EXPERIENCE_DEFAULT_CATEGORY_WEIGHT,
	PRACTICAL_EXPERIENCE_KEYWORD_HIT_CAP,
	PRACTICAL_EXPERIENCE_POINT_PER_HIT,
	PRACTICAL_EXPERIENCE_RATING_MULTIPLIER,
	PRACTICAL_EXPERIENCE_SCORE_CAP,
	formatPracticalExperiencesForApi,
	getActivePracticalExperiences,
	getPracticalExperienceCategoryWeight,
} from "./practicalExperience";
export {
	OCCUPATION_TAGS,
	OCCUPATION_TAG_BY_ID,
	resolveOccupationTag,
	getOccupationTagDefinition,
	type OccupationTagId,
	type OccupationTagDefinition,
} from "./occupationTags";

export {
	SHORT_DESCRIPTION_PROMPT,
	resolveOccupationShortDescription,
} from "./shortDescription";

export {
	type Bundesland,
	BUNDESLAENDER,
	isBundesland,
	traineeCountInState,
	traineeCountAcrossStates,
	hasAvailabilityData,
} from "./availability";

export { normName } from "./normName";

export {
	type PreferredJobMatchTier,
	PREFERRED_JOB_EXACT_BOOST,
	PREFERRED_JOB_SUBSTRING_BOOST,
	PREFERRED_JOB_KEYWORD_POINT_PER_HIT,
	PREFERRED_JOB_KEYWORD_HIT_CAP,
	PREFERRED_JOB_SCORE_CAP,
	PREFERRED_JOB_BOOST_BY_TIER,
} from "./preferredJobs";
