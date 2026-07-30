import type {
	AccessLevel,
	EducationLevel,
	Occupation,
	PopularityTier,
	UserProfile,
} from "@azuki/shared";
import {
	INTERESTS,
	getPopularityTier,
	strengthScorePoints,
	getActivePracticalExperiences,
	getPracticalExperienceCategoryWeight,
	occupationMatchesStrength,
} from "@azuki/shared";
import type { SalaryBands } from "./salaryScoreBands.js";
import {
	CREATIVITY_SKILL_TAGS,
	NO_GO_MAP,
	WORK_PREF_MAP,
	WORK_EXPECTATIONS_CHECKS,
	PRACTICAL_EXPERIENCE_KEYWORD_HIT_CAP,
	PRACTICAL_EXPERIENCE_POINT_PER_HIT,
	PRACTICAL_EXPERIENCE_RATING_MULTIPLIER,
	PRACTICAL_EXPERIENCE_SCORE_CAP,
} from "./config.js";

const INTEREST_BY_ID = new Map(
	INTERESTS.map((interest) => [interest.id, interest]),
);

/**
 * Additive bonus/penalty per popularity tier. Reflects findability in the
 * German Ausbildungsmarkt: A-anchor roles (≥5,000 starts/yr) get a small
 * lift; D/E/G roles get penalized because in practice almost nobody can find
 * an Ausbildungsplatz. F_fachpraktiker stays neutral — the §66 records were
 * hydrated from their parent Ausbildung and stand on the parent's signals;
 * a separate popularity bonus would double-count.
 *
 * Magnitudes chosen so the A→E spread (+5 to -6 = 11 points) is just enough
 * to flip the typical 8-12 point gap between a niche-but-profile-matched
 * Beruf and a popular-but-thin-fit Beruf without making popularity dominate
 * profile signals. No-go penalties (-5 to -10) and workPref rewards (+2)
 * remain the larger levers.
 */
const POPULARITY_TIER_SCORE: Record<PopularityTier, number> = {
	A_anchor: 5,
	B_solid: 2,
	C_smallReal: 0,
	D_niche: -3,
	E_vanishing: -6,
	F_fachpraktiker: 0,
	F_doppelqual: 0,
	G_unknown: -2,
};

/**
 * §66 BBiG / §42r HwO Fachpraktiker variants are designed specifically for
 * learners with limited education or learning support needs. The popularity
 * tier alone doesn't reflect that: their absolute starts/yr are small, but
 * they're the *intended* path for these profiles. For design-intent users
 * (secondary/foreign_degree/none), replace the F_fachpraktiker score with
 * `parent's tier score + 1` so each §66 record sits just above its parent.
 *
 * Parent-aware tracking comes from hydrate-fachpraktiker, which sets
 * `parentId` on every resolved §66 record. Unresolved §66 records (no
 * algorithmic or override match) fall back to the flat bonus.
 */
const FACHPRAKTIKER_BOOST_EDU_LEVELS = new Set<EducationLevel>([
	"secondary",
	"foreign_degree",
	"none",
]);
const FACHPRAKTIKER_DESIGN_INTENT_BONUS = 1;
const FACHPRAKTIKER_FALLBACK_BOOST = 3;

export function scorePopularity(
	occupation: Occupation,
	profile?: UserProfile,
): number {
	const tier = getPopularityTier(occupation.id);
	if (!tier) {
		// Off-index Berufe (mostly newly added). Treat like G_unknown.
		return POPULARITY_TIER_SCORE.G_unknown;
	}

	const eduLevel = profile?.educationLevel;
	const isDesignIntent =
		tier === "F_fachpraktiker" &&
		eduLevel !== undefined &&
		eduLevel !== null &&
		FACHPRAKTIKER_BOOST_EDU_LEVELS.has(eduLevel);

	if (!isDesignIntent) {
		return POPULARITY_TIER_SCORE[tier];
	}

	// Parent-aware: §66 sits just above its parent's popularity tier, but
	// never below the F_fachpraktiker baseline. A vanishing/niche-tier parent
	// must not make the §66 variant score worse for its intended audience than
	// the flat baseline a general user receives — that would invert the boost.
	if (typeof occupation.parentId === "number") {
		const parentTier = getPopularityTier(occupation.parentId);
		const parentScore = parentTier
			? POPULARITY_TIER_SCORE[parentTier]
			: POPULARITY_TIER_SCORE.G_unknown;
		return Math.max(
			POPULARITY_TIER_SCORE.F_fachpraktiker,
			parentScore + FACHPRAKTIKER_DESIGN_INTENT_BONUS,
		);
	}

	// Unresolved §66 record (rare): use the flat fallback so it doesn't
	// sit at the F_fachpraktiker baseline of 0 for its intended audience.
	return POPULARITY_TIER_SCORE[tier] + FACHPRAKTIKER_FALLBACK_BOOST;
}

// AccessLevel tier ordering. Higher number = harder to access.
function accessLevelTier(level: AccessLevel): number {
	switch (level) {
		case "unrestricted":
		case "hauptschule":
			return 0;
		case "realschule":
			return 1;
		case "fachhochschulreife":
			return 2;
		default:
			throw new Error(`Unhandled access level: ${level as string}`);
	}
}

// User's education tier mapped to the same scale.
// `foreign_degree` is intentionally treated as tier 0 — the practical
// realism for an unverified foreign degree without B2 German is closest
// to the Hauptschule track.
function userEducationTier(level: EducationLevel): number | null {
	switch (level) {
		case "none":
		case "secondary":
		case "extended_secondary":
		case "foreign_degree":
			return 0;
		case "intermediate":
			return 1;
		case "vocational_diploma":
		case "university_entrance":
			return 2;
		case "unknown":
			return null;
		default:
			throw new Error(`Unhandled education level: ${level as string}`);
	}
}

function accessLevelPenalty(
	level: AccessLevel,
	userLevel: EducationLevel,
): number {
	const userTier = userEducationTier(userLevel);
	if (userTier === null) {
		return 0;
	}
	const gap = accessLevelTier(level) - userTier;
	if (gap <= 0) {
		return 0;
	}
	if (gap === 1) {
		return -3;
	}
	// gap === 2: FHR required, user at Hauptschule level (incl. foreign_degree).
	// Qualitative step-change rather than incremental — closing this gap requires
	// either a recognized German Schulabschluss-Aufstockung OR a deutsche
	// Berufsausbildung-Alternative (Realschule + abgeschlossene Berufsausbildung
	// counts under the BERUFENET phrasing). Penalty was -7 prior to May 2026;
	// raised to -12 after the Amira persona eval showed FHR-gated headlines
	// (Erzieher, Pflegefachmann full Ausbildung) still reaching the LLM
	// candidate menu (top 20-30) despite the gate — the +30 of multi-dim
	// direction signal for a care-direction profile easily overrode -7.
	// Sweep confirmed -12 pushes Erzieher (9162) and Pflegefachmann (132173)
	// out of Amira's prefilter top-60 with zero collateral on the 7 other
	// personas (intermediate-level users hit gap=1, unaffected; other
	// Hauptschule-level personas don't have FHR-gated Berufe in their
	// direction). See tools/eval-baseline/access-penalty-sweep.ts.
	return -12;
}

export function scoreEducation(
	occupation: Occupation,
	profile: UserProfile,
): number {
	// Joblinge conservative default: when the user hasn't answered the
	// education question we treat them as Hauptschule-level. The target
	// audience's realistic floor is `secondary`, so empty-profile users
	// should see accessible Berufe rather than the same Realschule/FHR
	// menu as university-track users. Anyone who genuinely wants to
	// override this picks a level in onboarding.
	const effectiveLevel: EducationLevel = profile.educationLevel ?? "secondary";

	// Primary signal: workforce composition stats (BERUFENET field a31-12).
	// When present, this is the strongest education-realism signal.
	if (occupation.degreeStats) {
		const stats = occupation.degreeStats;
		switch (effectiveLevel) {
			case "secondary":
			case "extended_secondary":
				// Penalize if < 10% of workers hold a secondary degree or lower
				if (stats.secondary + stats.noQualification < 10) {
					return -10;
				}
				break;
			case "intermediate":
				// Penalize if < 10% of workers hold an intermediate degree or lower
				if (stats.intermediate + stats.secondary + stats.noQualification < 10) {
					return -5;
				}
				break;
			case "none":
				// Penalize if < 10% of workers have no formal qualification
				if (stats.noQualification < 10) {
					return -15;
				}
				break;
			case "university_entrance":
			case "vocational_diploma":
			case "foreign_degree":
			case "unknown":
				break;
			default:
				break;
		}
		return 0;
	}

	// Fallback signal: legal access requirements (BERUFENET field a30-0).
	// Used when degreeStats is null — covers all §66 Fachpraktiker, schulische
	// Ausbildungen (Erzieher, Sozialassistent, Altenpflegehelfer), most
	// Assistent/in variants. ~49% of all Berufe.
	if (occupation.accessLevel) {
		return accessLevelPenalty(occupation.accessLevel, effectiveLevel);
	}

	return 0;
}

/**
 * Heuristic: an occupation whose primary work is social (sozial-beratend at
 * index 0 or 1) and that doesn't involve industrial machinery is a
 * people-care environment — Kindergarten, Pflege, retail floor, salon —
 * rather than a Werkstatt/Produktion environment.
 *
 * BERUFENET uses single boolean tags (`Lärm`, `Schweres Heben`) that fire
 * in both industrial and people-care contexts. When a Joblinge-target user
 * selects these as no-gos they typically mean industrial Werkstatt noise
 * or workshop lifting (per the persona rubrics) — not Kindergartenalltag
 * or transferring patients. Treating them the same way exiles entire care
 * families (Erzieher, Altenpflegehelfer, GuK-Helfer) from menus where they
 * genuinely fit the profile and are the intended target audience.
 *
 * When this heuristic fires we apply a soft -1 instead of the full -5,
 * acknowledging the condition without excluding the Beruf from competition.
 */
function isPeopleEnvironmentContext(occupation: Occupation): boolean {
	const dominantSocial = occupation.interests
		.slice(0, 2)
		.includes("sozial-beratend");
	return dominantSocial && !occupation.conditions.machinery;
}

// No-gos whose BERUFENET tag fires in both industrial and people-care
// contexts. For these we soften the penalty in people-care contexts.
const PEOPLE_ENVIRONMENT_SOFT_NO_GOS = new Set(["noise", "heavy-work"]);

const NO_GO_PENALTY = -5;
const NO_GO_SOFT_PENALTY = -1;

export function scoreNoGos(
	occupation: Occupation,
	profile: UserProfile,
): number {
	let penalty = 0;
	for (const [id, answer] of Object.entries(profile.noGos)) {
		if (answer !== "rejected") {
			continue;
		}
		const check = NO_GO_MAP[id];
		if (!check || !check(occupation)) {
			continue;
		}
		if (
			PEOPLE_ENVIRONMENT_SOFT_NO_GOS.has(id) &&
			isPeopleEnvironmentContext(occupation)
		) {
			penalty += NO_GO_SOFT_PENALTY;
			continue;
		}
		penalty += NO_GO_PENALTY;
	}
	return penalty;
}

export function scoreWorkPreferences(
	occupation: Occupation,
	profile: UserProfile,
): number {
	let score = 0;
	for (const [id, choice] of Object.entries(profile.workPreferences)) {
		if (!choice) {
			continue;
		}
		const mapping = WORK_PREF_MAP[id];
		if (!mapping) {
			continue;
		}

		const selectedOptionCheck = choice === "a" ? mapping.a : mapping.b;
		if (selectedOptionCheck(occupation)) {
			score += 2;
		}
	}
	return score;
}

export function scoreSubjects(
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

/**
 * Scores how well an occupation matches the user's selected interests.
 * Uses a two-tier system (category + keyword) and returns a non-negative score.
 *
 * @example Input shapes
 *   profile.interests     = ["gaming", "photography"]   // user-selected interest IDs
 *   occupation.interests  = ["theoretisch-abstrakt", "kreativ-gestaltend", ...]  // BERUFENET tags, order = relevance
 *   occupation.interestKeywords = ["software", "system", "fotografieren", "kamera", ...]
 */
export function scoreInterests(
	occupation: Occupation,
	profile: UserProfile,
): number {
	let score = 0;

	// Flatten the user's selected interest IDs into BERUFENET categories and match keywords.
	// e.g. profile.interests ["gaming","photography"] → userCategories {"theoretisch-abstrakt","kreativ-gestaltend"}, userKeywords {"computer","software","fotografieren","kamera",...}
	const userCategories = new Set<string>();
	const userKeywords = new Set<string>();
	for (const interestId of profile.interests) {
		const interestDefinition = INTEREST_BY_ID.get(interestId);
		if (!interestDefinition) {
			continue;
		}

		for (const category of interestDefinition.berufenetTags) {
			userCategories.add(category);
		}
		for (const keyword of interestDefinition.matchKeywords) {
			userKeywords.add(keyword.toLowerCase());
		}
	}

	// Tier 1: broad BERUFENET category matching. Earlier position in occupation.interests = stronger signal (index 0 → 3 pts, 1 → 2 pts, 2+ → 1 pt).
	// e.g. occupation.interests = ["theoretisch-abstrakt", "kreativ-gestaltend", "praktisch-konkret"] → matching "theoretisch-abstrakt" at index 0 gives +3.
	for (const cat of userCategories) {
		const interestIndex = occupation.interests.indexOf(cat);
		if (interestIndex === 0) {
			score += 3;
		} else if (interestIndex === 1) {
			score += 2;
		} else if (interestIndex >= 2) {
			score += 1;
		} else if (
			cat === "kreativ-gestaltend" &&
			CREATIVITY_SKILL_TAGS.some((tag) => occupation.skillTags.includes(tag))
		) {
			score += 1;
		}
	}

	// Tier 2: granular keyword overlap; contribution capped at 3 so it doesn't outweigh category match.
	// e.g. userKeywords ∩ occupation.interestKeywords = {"software","kamera"} → 2 hits → +2 (or +3 if ≥3 overlaps).
	let keywordHits = 0;
	const occupationKeywords = new Set(
		occupation.interestKeywords.map((keyword) => keyword.toLowerCase()),
	);
	for (const keyword of userKeywords) {
		if (occupationKeywords.has(keyword)) {
			keywordHits++;
		}
	}
	score += Math.min(keywordHits, 3);

	return score;
}

const PRACTICAL_EXPERIENCE_STOP_WORDS = new Set([
	"der",
	"die",
	"das",
	"den",
	"dem",
	"des",
	"ein",
	"eine",
	"einer",
	"eines",
	"einem",
	"einen",
	"und",
	"oder",
	"mit",
	"ohne",
	"für",
	"von",
	"auf",
	"im",
	"in",
	"am",
	"an",
	"aus",
	"bei",
	"zu",
	"zur",
	"zum",
	"auch",
	"mal",
]);

function tokenizePracticalExperienceText(text: string): string[] {
	return text
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s-]+/gu, " ")
		.split(/[\s-]+/)
		.map((token) => token.trim())
		.filter(
			(token) =>
				token.length >= 4 && !PRACTICAL_EXPERIENCE_STOP_WORDS.has(token),
		);
}

function buildOccupationMatchTerms(occupation: Occupation): Set<string> {
	const terms = new Set<string>();
	for (const token of tokenizePracticalExperienceText(occupation.name)) {
		terms.add(token);
	}
	for (const keyword of occupation.interestKeywords) {
		terms.add(keyword.toLowerCase());
	}
	for (const tag of occupation.skillTags) {
		terms.add(tag.toLowerCase());
	}
	return terms;
}

function countPracticalExperienceKeywordHits(
	description: string,
	occupation: Occupation,
): number {
	const descTokens = tokenizePracticalExperienceText(description);
	if (descTokens.length === 0) {
		return 0;
	}

	const descNorm = description.toLowerCase();
	const occupationTerms = buildOccupationMatchTerms(occupation);
	let hits = 0;

	for (const term of occupationTerms) {
		const exactTokenMatch = descTokens.includes(term);
		const termInDescription = descNorm.includes(term);
		const tokenOverlap = descTokens.some(
			(token) => term.includes(token) || token.includes(term),
		);
		if (exactTokenMatch || termInDescription || tokenOverlap) {
			hits++;
		}
	}

	return Math.min(hits, PRACTICAL_EXPERIENCE_KEYWORD_HIT_CAP);
}

function practicalExperienceRatingMultiplier(rating: number): number {
	return PRACTICAL_EXPERIENCE_RATING_MULTIPLIER[rating] ?? 0;
}

/**
 * Scores how well an occupation matches the user's practical experiences.
 * Combines category weight (internship/job > school/club > home/friends),
 * keyword overlap with occupation metadata (name, interestKeywords, skillTags),
 * and a star-rating multiplier. Capped at ±8 to nudge the prefilter shortlist.
 */
export function scorePracticalExperience(
	occupation: Occupation,
	profile: UserProfile,
): number {
	const experiences = getActivePracticalExperiences(
		profile.practicalExperiences,
		profile.selectedPracticalExperienceIds,
	);
	if (experiences.length === 0) {
		return 0;
	}

	let score = 0;
	for (const entry of experiences) {
		const keywordHits = countPracticalExperienceKeywordHits(
			entry.description,
			occupation,
		);
		if (keywordHits === 0) {
			continue;
		}

		const categoryWeight = getPracticalExperienceCategoryWeight(
			entry.selectedExperienceId,
		);
		const ratingMultiplier = practicalExperienceRatingMultiplier(entry.rating);
		if (ratingMultiplier === 0) {
			continue;
		}

		score +=
			keywordHits *
			PRACTICAL_EXPERIENCE_POINT_PER_HIT *
			categoryWeight *
			ratingMultiplier;
	}

	return Math.min(score, PRACTICAL_EXPERIENCE_SCORE_CAP);
}

// Dispatcher over 7 fixed strength dimensions, each with bespoke checks.
// Revisit if growing past ~10 dimensions or adding cross-cutting logic.
export function scoreStrengths(
	occupation: Occupation,
	profile: UserProfile,
): number {
	let score = 0;

	for (const [strengthId, value] of Object.entries(profile.strengths)) {
		const points = strengthScorePoints(value);
		if (points === 0) {
			continue;
		}

		if (occupationMatchesStrength(strengthId, occupation)) {
			score += points;
		}
	}

	return score;
}

export function scoreWorkExpectations(
	occupation: Occupation,
	profile: UserProfile,
	salaryBands?: SalaryBands | null,
): number {
	let score = 0;

	for (const expectationId of profile.workExpectations ?? []) {
		if (expectationId === "good_salary") {
			if (!occupation.salaryKnown || occupation.salaryMonthlyMedian === null) {
				continue;
			}
			if (!salaryBands) {
				continue;
			}

			if (occupation.salaryMonthlyMedian >= salaryBands.upperBandMin) {
				score += 3;
			} else if (occupation.salaryMonthlyMedian >= salaryBands.lowerBandMin) {
				score += 1;
			}
			continue;
		}

		if (expectationId === "short_distance") {
			// Symmetric: reward fixed-location Berufe and penalize travel-heavy
			// ones. An asymmetric penalty made the value selection useless on
			// retail/logistik for users who chose it specifically because they
			// want to stay close to home.
			if (
				occupation.conditions.frequentAbsence ||
				occupation.conditions.changingWorkplaces
			) {
				score -= 2;
			} else {
				score += 2;
			}
			continue;
		}

		const check = WORK_EXPECTATIONS_CHECKS[expectationId];
		if (check && check(occupation)) {
			score += 2;
		}
	}

	return score;
}
