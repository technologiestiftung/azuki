/**
 * Occupation–profile scoring engine.
 *
 * Each occupation is scored against a user profile across eight dimensions:
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
 *   6. Strengths — rewards occupations whose required strength tags match
 *      user-rated strengths, with a conditions-based fallback for craftsmanship.
 *   7. Work values — rewards occupations matching selected work values; the
 *      salary value uses percentile bands from SalaryBands.
 *   8. Popularity — additive bonus/penalty based on the popularity tier
 *      from POPULARITY_INDEX. A-anchor roles get a small lift; D/E/G niche
 *      roles get penalized to keep them out of top-40 menus unless the
 *      profile signal is exceptionally strong. Includes a §66 Fachpraktiker
 *      boost when educationLevel ∈ {secondary, foreign_degree, none}, since
 *      §66 records exist specifically for limited-education profiles.
 *
 * SalaryBands is built from the occupation set and provides salary
 * percentile thresholds used by the good_salary work value.
 */

import type { Occupation, UserProfile } from "@azuki/shared";
import type { SalaryBands } from "./salaryScoreBands.js";
import {
	scoreEducation,
	scoreInterests,
	scoreNoGos,
	scorePopularity,
	scoreStrengths,
	scoreSubjects,
	scoreWorkPreferences,
	scoreWorkExpectations,
} from "./dimensions.js";

export { buildSalaryBands } from "./salaryScoreBands.js";
export type { SalaryBands } from "./salaryScoreBands.js";

export function scoreOccupation(
	occupation: Occupation,
	profile: UserProfile,
	salaryBands?: SalaryBands | null,
): number {
	let score = 0;

	score += scoreEducation(occupation, profile);
	score += scoreNoGos(occupation, profile);
	score += scoreWorkPreferences(occupation, profile);
	score += scoreSubjects(occupation, profile);
	score += scoreInterests(occupation, profile);
	score += scoreStrengths(occupation, profile);
	score += scoreWorkExpectations(occupation, profile, salaryBands);
	score += scorePopularity(occupation, profile);

	return score;
}
