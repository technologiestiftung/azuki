import type { Occupation } from "@azuki/shared";
import {
	PREFERRED_JOB_KEYWORD_HIT_CAP,
	normName,
	type PreferredJobMatchTier,
} from "@azuki/shared";

export interface ResolvedPreferredJobMatch {
	preferredJob: string;
	occupation: Occupation;
	tier: PreferredJobMatchTier;
	keywordHits?: number;
}

// Keyword tier tokenizes vague free text (e.g. "irgendwas mit Medien").
// Drop grammar, filler, and generic career words so hits reflect
// meaningful content tokens rather than noise shared by many occupations.
const KEYWORD_STOP_WORDS = new Set([
	"irgendwas",
	"irgendwo",
	"irgendwie",
	"etwas",
	"einen",
	"eine",
	"einer",
	"einem",
	"eines",
	"oder",
	"welche",
	"welcher",
	"welches",
	"job",
	"jobs",
	"beruf",
	"berufe",
	"ausbildung",
	"ausbildungen",
	"mit",
	"und",
	"der",
	"die",
	"das",
	"den",
	"dem",
	"des",
	"ein",
	"für",
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

function tokenizePreferredJobText(text: string): string[] {
	return text
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s-]+/gu, " ")
		.split(/[\s-]+/)
		.map((token) => token.trim())
		.filter((token) => token.length >= 4 && !KEYWORD_STOP_WORDS.has(token));
}

function buildOccupationMatchTerms(occupation: Occupation): Set<string> {
	const terms = new Set<string>();
	for (const token of tokenizePreferredJobText(occupation.name)) {
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

function countKeywordHits(
	preferredJob: string,
	occupation: Occupation,
): number {
	const tokens = tokenizePreferredJobText(preferredJob);
	if (tokens.length === 0) {
		return 0;
	}

	const occupationTerms = buildOccupationMatchTerms(occupation);
	let hits = 0;

	// Exact term or name substring only — no keyword overlap ("pflege" ⊂ "pflegen").
	for (const token of tokens) {
		const exactTokenMatch = occupationTerms.has(token);
		const tokenInOccupationName = occupation.name.toLowerCase().includes(token);
		if (exactTokenMatch || tokenInOccupationName) {
			hits++;
		}
	}

	return Math.min(hits, PREFERRED_JOB_KEYWORD_HIT_CAP);
}

const MIN_DEGENDERED_STEM = 5;

/**
 * normName only collapses gender forms written with a slash ("Elektroniker/in").
 * Users type the plain feminine ("Elektrikerin"), which then contains neither
 * the occupation name nor vice versa, so the wish resolves to nothing. Offer
 * the stem as a second candidate.
 */
function preferredJobNormCandidates(preferredJob: string): string[] {
	const norm = normName(preferredJob);
	if (!norm) {
		return [];
	}
	const stem = norm.replace(/in$/, "");
	return stem !== norm && stem.length >= MIN_DEGENDERED_STEM
		? [norm, stem]
		: [norm];
}

function resolveTierForOccupation(
	preferredJob: string,
	occupation: Occupation,
): PreferredJobMatchTier | null {
	const occupationNorm = normName(occupation.name);
	const candidates = preferredJobNormCandidates(preferredJob);
	if (!occupationNorm || candidates.length === 0) {
		return null;
	}

	if (candidates.some((candidate) => candidate === occupationNorm)) {
		return "exact";
	}

	if (
		candidates.some(
			(candidate) =>
				occupationNorm.includes(candidate) ||
				candidate.includes(occupationNorm),
		)
	) {
		return "substring";
	}

	const keywordHits = countKeywordHits(preferredJob, occupation);
	return keywordHits > 0 ? "keyword" : null;
}

const TIER_PRIORITY: Record<PreferredJobMatchTier, number> = {
	exact: 0,
	substring: 1,
	keyword: 2,
};

/**
 * Orders by match tier, not by boost points. Ranking by points would let a
 * keyword hit outrank the exactly named Beruf whenever the keyword ceiling
 * sits above the exact boost, which pushes the named Beruf out of the
 * shortlist injection window.
 */
function sortPreferredJobMatches(
	matches: ResolvedPreferredJobMatch[],
): ResolvedPreferredJobMatch[] {
	return [...matches].sort((a, b) => {
		const tierDiff = TIER_PRIORITY[a.tier] - TIER_PRIORITY[b.tier];
		if (tierDiff !== 0) {
			return tierDiff;
		}
		const hitDiff = (b.keywordHits ?? 0) - (a.keywordHits ?? 0);
		if (hitDiff !== 0) {
			return hitDiff;
		}
		return a.occupation.name.localeCompare(b.occupation.name, "de");
	});
}

export function resolvePreferredJobsForText(
	preferredJob: string,
	occupations: Occupation[],
): ResolvedPreferredJobMatch[] {
	const trimmed = preferredJob.trim();
	if (!trimmed) {
		return [];
	}

	const matches: ResolvedPreferredJobMatch[] = [];
	for (const occupation of occupations) {
		const tier = resolveTierForOccupation(trimmed, occupation);
		if (!tier) {
			continue;
		}
		matches.push({
			preferredJob: trimmed,
			occupation,
			tier,
			keywordHits:
				tier === "keyword" ? countKeywordHits(trimmed, occupation) : undefined,
		});
	}

	return sortPreferredJobMatches(matches);
}

export function resolvePreferredJobs(
	preferredJobs: string[],
	occupations: Occupation[],
): ResolvedPreferredJobMatch[] {
	const seenOccupationIds = new Set<number>();
	const resolved: ResolvedPreferredJobMatch[] = [];

	for (const preferredJob of preferredJobs) {
		const matches = resolvePreferredJobsForText(preferredJob, occupations);
		for (const match of matches) {
			if (seenOccupationIds.has(match.occupation.id)) {
				continue;
			}
			seenOccupationIds.add(match.occupation.id);
			resolved.push(match);
		}
	}

	return sortPreferredJobMatches(resolved);
}

export function getBestPreferredJobTierForOccupation(
	occupation: Occupation,
	preferredJobs: string[],
): {
	tier: PreferredJobMatchTier;
	keywordHits: number;
} | null {
	let best: {
		tier: PreferredJobMatchTier;
		keywordHits: number;
	} | null = null;

	const tierRank: Record<PreferredJobMatchTier, number> = {
		exact: 0,
		substring: 1,
		keyword: 2,
	};

	for (const preferredJob of preferredJobs) {
		const tier = resolveTierForOccupation(preferredJob, occupation);
		if (!tier) {
			continue;
		}
		const keywordHits =
			tier === "keyword" ? countKeywordHits(preferredJob, occupation) : 0;
		if (
			!best ||
			tierRank[tier] < tierRank[best.tier] ||
			(tier === best.tier &&
				tier === "keyword" &&
				keywordHits > best.keywordHits)
		) {
			best = { tier, keywordHits };
		}
	}

	return best;
}

// Must stay in sync with the max occupation count in VacanciesRequestSchema
// (backend/src/schemas/vacancies.ts).
const VACANCY_OCCUPATION_LIMIT = 20;
const VACANCY_PREFERRED_RESOLVED_LIMIT = 5;
const VACANCY_WILDCARD_LIMIT = 5;

export function mergeVacancyOccupationNames(
	preferredOccupationNames: string[],
	matchOccupationNames: string[],
	wildcardOccupationNames: string[] = [],
): string[] {
	const merged: string[] = [];
	const seen = new Set<string>();

	const addName = (name: string) => {
		const key = normName(name);
		if (!key || seen.has(key)) {
			return;
		}
		seen.add(key);
		merged.push(name);
	};

	for (const name of preferredOccupationNames) {
		if (merged.length >= VACANCY_OCCUPATION_LIMIT) {
			break;
		}
		addName(name);
	}

	const remainingSlots = VACANCY_OCCUPATION_LIMIT - merged.length;
	let filled = 0;
	for (const name of matchOccupationNames) {
		if (filled >= remainingSlots) {
			break;
		}
		addName(name);
		filled++;
	}

	// Wildcard names get their own reserved budget, on top of the regular
	// limit, so they can never be crowded out by preferred/regular names.
	let wildcardFilled = 0;
	for (const name of wildcardOccupationNames) {
		if (wildcardFilled >= VACANCY_WILDCARD_LIMIT) {
			break;
		}
		addName(name);
		wildcardFilled++;
	}

	return merged;
}

export function resolvePreferredJobVacancyNames(
	preferredJobs: string[],
	occupations: Occupation[],
): string[] {
	const resolved = resolvePreferredJobs(preferredJobs, occupations);
	const names: string[] = [];
	const seen = new Set<string>();
	const resolvedPreferredTexts = new Set<string>();

	for (const match of resolved) {
		if (names.length >= VACANCY_PREFERRED_RESOLVED_LIMIT) {
			break;
		}
		const key = normName(match.occupation.name);
		if (!key || seen.has(key)) {
			continue;
		}
		seen.add(key);
		resolvedPreferredTexts.add(normName(match.preferredJob));
		names.push(match.occupation.name);
	}

	// Only fall back to raw free text when nothing resolved — otherwise
	// phrases like "ein Job in der Pflege" waste slots and aren't displayable.
	for (const preferredJob of preferredJobs) {
		const key = normName(preferredJob);
		if (!key || seen.has(key) || resolvedPreferredTexts.has(key)) {
			continue;
		}
		seen.add(key);
		names.push(preferredJob.trim());
	}

	return names;
}
