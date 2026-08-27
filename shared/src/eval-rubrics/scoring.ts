/** Persona eval rubric — keep in sync with ScoringExplainer. */
export const EVAL_POINTS_TIER_S = 2;
export const EVAL_POINTS_TIER_A = 1;
export const EVAL_TOP_N = 20;

/**
 * Points reachable for one persona: its own Tier S/A entries fill `slots`,
 * best tier first. Two things bound the ceiling and both must be respected —
 * personas carry far fewer Tier-S entries than there are slots, and the ranker
 * may return fewer results than EVAL_TOP_N. Charging for slots that were never
 * offered or never filled pins every score near zero.
 *
 * Grading only what was returned means a very short list is easy to score well
 * on, so callers should surface the result count next to the percentage.
 */
export function evalMaxPoints(
	tierSCount: number,
	tierACount: number,
	slots: number = EVAL_TOP_N,
): number {
	const graded = Math.max(0, Math.min(slots, EVAL_TOP_N));
	const tierSSlots = Math.min(tierSCount, graded);
	const tierASlots = Math.min(tierACount, graded - tierSSlots);
	return tierSSlots * EVAL_POINTS_TIER_S + tierASlots * EVAL_POINTS_TIER_A;
}

export const EVAL_VERDICT_FAIL_BELOW = 50;
export const EVAL_VERDICT_CONCERNS_BELOW = 80;
export const EVAL_VERDICT_PASS_BELOW = 100;
