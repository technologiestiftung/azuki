export type PreferredJobMatchTier = "exact" | "substring" | "keyword";

// Kept above the keyword ceiling (HIT_CAP x POINT_PER_HIT) so a named Beruf
// always outscores vague keyword hits from the same text.
export const PREFERRED_JOB_EXACT_BOOST = 10;
export const PREFERRED_JOB_SUBSTRING_BOOST = 9;
export const PREFERRED_JOB_KEYWORD_POINT_PER_HIT = 2;
export const PREFERRED_JOB_KEYWORD_HIT_CAP = 4;
export const PREFERRED_JOB_SCORE_CAP = 30;

export const PREFERRED_JOB_BOOST_BY_TIER: Record<
	PreferredJobMatchTier,
	number
> = {
	exact: PREFERRED_JOB_EXACT_BOOST,
	substring: PREFERRED_JOB_SUBSTRING_BOOST,
	keyword: PREFERRED_JOB_KEYWORD_POINT_PER_HIT,
};
