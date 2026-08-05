import type { Occupation } from "@azuki/shared";
import {
	PREFERRED_JOB_BOOST_BY_TIER,
	PREFERRED_JOB_KEYWORD_HIT_CAP,
	PREFERRED_JOB_KEYWORD_POINT_PER_HIT,
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

function resolveTierForOccupation(
	preferredJob: string,
	occupation: Occupation,
): PreferredJobMatchTier | null {
	const preferredNorm = normName(preferredJob);
	const occupationNorm = normName(occupation.name);
	if (!preferredNorm || !occupationNorm) {
		return null;
	}

	if (preferredNorm === occupationNorm) {
		return "exact";
	}

	if (
		occupationNorm.includes(preferredNorm) ||
		preferredNorm.includes(occupationNorm)
	) {
		return "substring";
	}

	const keywordHits = countKeywordHits(preferredJob, occupation);
	return keywordHits > 0 ? "keyword" : null;
}

function preferredJobMatchScore(match: ResolvedPreferredJobMatch): number {
	if (match.tier === "keyword") {
		return (match.keywordHits ?? 0) * PREFERRED_JOB_KEYWORD_POINT_PER_HIT;
	}
	return PREFERRED_JOB_BOOST_BY_TIER[match.tier];
}

function sortPreferredJobMatches(
	matches: ResolvedPreferredJobMatch[],
): ResolvedPreferredJobMatch[] {
	return [...matches].sort((a, b) => {
		const scoreDiff = preferredJobMatchScore(b) - preferredJobMatchScore(a);
		if (scoreDiff !== 0) {
			return scoreDiff;
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

const VACANCY_OCCUPATION_LIMIT = 20;
const VACANCY_PREFERRED_RESOLVED_LIMIT = 5;

export function mergeVacancyOccupationNames(
	preferredOccupationNames: string[],
	matchOccupationNames: string[],
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
