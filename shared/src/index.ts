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
	VacancyAddress,
	VacancyDetail,
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

export { WILDCARD_POOL_OCCUPATION_IDS, isInWildcardPool } from "./wildcardPool";

export {
	EVAL_TOP_N,
	evalMaxPoints,
	EVAL_POINTS_TIER_S,
	EVAL_POINTS_TIER_A,
	EVAL_VERDICT_CONCERNS_BELOW,
	EVAL_VERDICT_FAIL_BELOW,
	EVAL_VERDICT_PASS_BELOW,
} from "./eval-rubrics/scoring";
export { type Verdict, type ScoreReport } from "./eval-rubrics/types";

export type { Persona } from "./persona";

export { formatOccupationDisplayName } from "./occupationDisplayName";

export { getDurationOverride } from "./durationOverride";

export { fitPercent, scoreFromFitPercent } from "./fitPercent";

export {
	SHARED_OCCUPATIONS_PARAM,
	SHARED_POSTCODE_PARAM,
	SHARED_DISTANCE_PARAM,
	MAX_SHARED_OCCUPATIONS,
	parseSharedOccupationsParam,
	buildSharedOccupationsParam,
	type SharedOccupationEntry,
} from "./sharedMatchParams";

export {
	SHARED_PROFILE_PARAM,
	buildSharedProfileParam,
	parseSharedProfileParam,
	compactSharedProfile,
	expandSharedProfile,
} from "./sharedProfileParams";

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
	formatOccupationDuration,
	resolveOccupationDuration,
} from "./occupationDuration";

export { formatOccupationSalary } from "./formatOccupationSalary";

export { buildOccupationShareText } from "./occupationShareText";

export {
	TASK_BULLETS_PROMPT,
	resolveOccupationTaskBullets,
} from "./taskBullets";

export type {
	OccupationPredicate,
	WorkExpectationPredicate,
	WorkPreferenceOptionChecks,
} from "./matching/predicates";
export {
	CREATIVITY_SKILL_TAGS,
	CREATIVITY_STRENGTH_TAG,
	CRAFTSMANSHIP_SKILL_TAGS,
	COMMUNICATION_SKILL_TAGS,
	CONCENTRATION_SKILL_TAGS,
	hasCreativitySignal,
	LOGICAL_THINKING_SKILL_TAGS,
	NO_GO_MAP,
	occupationHasOutdoorWork,
	PRECISION_SKILL_TAGS,
	STRENGTH_TO_TAGS,
	WORK_EXPECTATIONS_CHECKS,
	WORK_PREF_MAP,
} from "./matching/predicates";
export { occupationMatchesStrength } from "./matching/strengthMatching";
export { scoreSingleInterestMatch } from "./matching/interestMatching";
export {
	getOccupationSearchTerms,
	scoreCustomTextMatch,
} from "./matching/textMatching";
export {
	inferNotMatchPillIdFromText,
	NO_GO_TO_PILL_ID,
	occupationMatchesNotMatchPill,
	profilePrefersIndoors,
} from "./matching/noGoPills";
export {
	collectMatchSignals,
	type MatchSignal,
	type MatchSignalDimension,
	type MatchSignalGroups,
	type MatchSignalKind,
} from "./matching/signals";

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
