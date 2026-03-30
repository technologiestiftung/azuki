import type { Occupation, UserProfile } from "@azuki/shared";
import { INTERESTS } from "@azuki/shared";
import type { SalaryBands } from "./salaryScoreBands.js";
import {
  NO_GO_MAP,
  STRENGTH_TO_TAGS,
  WORK_PREF_MAP,
  WORK_VALUE_CHECKS,
} from "./config.js";

const INTEREST_BY_ID = new Map(INTERESTS.map((interest) => [interest.id, interest]));

export function scoreEducation(
  occupation: Occupation,
  profile: UserProfile,
): number {
  if (!occupation.degreeStats || !profile.educationLevel) return 0;

  const stats = occupation.degreeStats;

  switch (profile.educationLevel) {
    case "secondary":
    case "extended_secondary":
      // Penalize if < 10% of workers hold a secondary degree or lower
      if (stats.secondary + stats.noQualification < 10) return -10;
      break;
    case "intermediate":
      // Penalize if < 10% of workers hold an intermediate degree or lower
      if (stats.intermediate + stats.secondary + stats.noQualification < 10)
        return -5;
      break;
    case "none":
      // Penalize if < 10% of workers have no formal qualification
      if (stats.noQualification < 10) return -15;
      break;
    // No penalty
    case "university_entrance":
    case "vocational_diploma":
    case "foreign_degree":
    case "unknown":
      break;
  }
  return 0;
}

export function scoreNoGos(
  occupation: Occupation,
  profile: UserProfile,
): number {
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

export function scoreWorkPreferences(
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
    if (!interestDefinition) continue;

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
    if (interestIndex === 0) score += 3;
    else if (interestIndex === 1) score += 2;
    else if (interestIndex >= 2) score += 1;
  }

  // Tier 2: granular keyword overlap; contribution capped at 3 so it doesn't outweigh category match.
  // e.g. userKeywords ∩ occupation.interestKeywords = {"software","kamera"} → 2 hits → +2 (or +3 if ≥3 overlaps).
  let keywordHits = 0;
  const occupationKeywords = new Set(
    (occupation.interestKeywords).map((keyword) => keyword.toLowerCase()),
  );
  for (const keyword of userKeywords) {
    if (occupationKeywords.has(keyword)) keywordHits++;
  }
  score += Math.min(keywordHits, 3);

  return score;
}

export function scoreStrengths(
  occupation: Occupation,
  profile: UserProfile,
): number {
  let score = 0;

  for (const [strengthId, value] of Object.entries(profile.strengths)) {
    // Only count strengths the user rated in the upper half.
    if (value < 0.5) continue;

    if (strengthId === "craftsmanship") {
      // Craftsmanship is inferred from practical/manual work conditions.
      if (
        occupation.conditions.manualLabor ||
        occupation.conditions.machinery
      ) {
        score += 2;
      }
      continue;
    }

    if (strengthId === "precision") {
      if (occupation.conditions.precisionWork) {
        score += 2;
      }
      continue;
    }

    if (strengthId === "concentration") {
      const concentrationTags = ["Konzentration", "Daueraufmerksamkeit"];
      if (
        concentrationTags.some((tag) => occupation.skillTags.includes(tag))
      ) {
        score += 2;
      }
      continue;
    }

    const tags = STRENGTH_TO_TAGS[strengthId];
    if (!tags?.length) continue;

    if (tags.some((tag) => occupation.strengthTags.includes(tag))) {
      score += 2;
    }
  }

  return score;
}

export function scoreWorkValues(
  occupation: Occupation,
  profile: UserProfile,
  salaryBands?: SalaryBands | null,
): number {
  let score = 0;

  for (const valueId of profile.workValues ?? []) {
    if (valueId === "good_salary") {
      if (!occupation.salaryKnown || occupation.salaryMonthlyMedian === null)
        continue;
      if (!salaryBands) continue;

      if (occupation.salaryMonthlyMedian >= salaryBands.upperBandMin)
        score += 3;
      else if (occupation.salaryMonthlyMedian >= salaryBands.lowerBandMin)
        score += 1;
      continue;
    }

    const check = WORK_VALUE_CHECKS[valueId];
    if (check && check(occupation)) {
      score += 2;
    }
  }

  return score;
}
