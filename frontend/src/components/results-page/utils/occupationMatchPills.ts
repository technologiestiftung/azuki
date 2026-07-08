// Maps shared match signals to themed UI pills. Signal detection lives in
// @azuki/shared/matching; this file handles presentation only.
import {
	collectMatchSignals,
	INTERESTS,
	type MatchSignal,
	type Occupation,
	type UserProfile,
} from "@azuki/shared";
import { content } from "../../../content";
import { categories as schoolSubjectCategories } from "../../competence-profile/steps/school-subject-step/school-subjects";

type ContentKey = keyof typeof content;

function isContentKey(key: string): key is ContentKey {
	return key in content;
}

function getContentString(key: ContentKey): string {
	const value = content[key];
	return typeof value === "string" ? value : "";
}

const MAX_PILLS = 5;

const INTEREST_BY_ID = new Map(
	INTERESTS.map((interest) => [interest.id, interest]),
);

const THEME_KEYWORD_PATTERNS: { theme: string; pattern: RegExp }[] = [
	{ theme: "natur", pattern: /natur|draußen|garten|pflanz|wald|wandern|grün/i },
	{
		theme: "handwerk",
		pattern: /werkzeug|auto|basteln|bauen|schraub|handwerk|reparier|werken/i,
	},
	{
		theme: "technik",
		pattern: /computer|technik|programm|digital|software|it\b/i,
	},
	{ theme: "tiere", pattern: /tier|hund|katze|stall|pfote/i },
	{
		theme: "menschen",
		pattern: /menschen|kunden|helfen|übersetz|sprach|kommunik/i,
	},
	{ theme: "kreativ", pattern: /kreativ|malen|zeichnen|musik|design|gestalt/i },
	{ theme: "sport", pattern: /sport|fitness|bewegung|laufen|training/i },
	{ theme: "team", pattern: /team|zusammen|gruppe/i },
];

const INTEREST_THEMES: Record<string, string[]> = {
	gaming: ["technik"],
	computer: ["technik"],
	photography: ["technik", "kreativ"],
	videos: ["technik", "kreativ"],
	drawing: ["kreativ"],
	painting: ["kreativ"],
	music: ["kreativ"],
	crafting: ["kreativ", "handwerk"],
	fashion: ["kreativ"],
	building: ["handwerk"],
	screwing: ["handwerk"],
	baking: ["handwerk"],
	cooking: ["handwerk"],
	gardening: ["natur", "handwerk"],
	animals: ["tiere", "natur"],
	hiking: ["natur"],
	camping: ["natur"],
	outdoors: ["natur"],
	fishing: ["natur", "tiere"],
	gym: ["sport"],
	team: ["team", "sport"],
	martialArts: ["sport"],
	dancing: ["kreativ", "sport"],
	cycling: ["sport", "natur"],
	skating: ["sport"],
	helping: ["menschen"],
	reading: ["menschen"],
	babysitting: ["menschen"],
	petCare: ["tiere", "menschen"],
	planning: ["menschen", "technik"],
};

const STRENGTH_THEMES: Record<string, string> = {
	teamwork: "team",
	"logical-thinking": "technik",
	creativity: "kreativ",
	communication: "menschen",
	craftsmanship: "handwerk",
	concentration: "konzentration",
	precision: "genauigkeit",
	perseverance: "ausdauer",
};

const SUBJECT_THEMES: Record<string, string> = {
	biology: "biologie",
	math: "mathematik",
	physics: "physik",
	chemistry: "chemie",
	computer_science: "technik",
	art: "kreativ",
	music: "kreativ",
	performing_arts: "kreativ",
	sports: "sport",
	german: "sprachen",
	english: "sprachen",
	other_languages: "sprachen",
	geography: "natur",
	home_economics: "handwerk",
};

const EXPECTATION_THEMES: Record<string, string> = {
	people_work: "menschen",
	teamwork_value: "team",
	modern_technology: "technik",
	remote: "technik",
};

const WORK_PREF_THEMES: Record<string, Partial<Record<"a" | "b", string>>> = {
	environment: { b: "natur" },
	location: { b: "natur" },
	"hands-vs-mind": { a: "handwerk", b: "technik" },
	variety: { b: "abwechslung" },
	people: { b: "menschen" },
	structure: { a: "aufgaben", b: "kreativ" },
};

export interface OccupationMatchPill {
	id: string;
	label: string;
	icon: string;
	summary: string;
	score: number;
}

export interface OccupationMatchPillGroups {
	matching: OccupationMatchPill[];
	notMatching: OccupationMatchPill[];
}

interface PillCandidate {
	pillKey: string;
	score: number;
	labelOverride?: string;
	iconOverride?: string;
	summaryOverride?: string;
}

interface SchoolSubjectMeta {
	label: string;
	icon: string;
}

function buildSchoolSubjectMetaLookup(): Map<string, SchoolSubjectMeta> {
	const lookup = new Map<string, SchoolSubjectMeta>();
	for (const category of schoolSubjectCategories) {
		for (const subject of category.subjects) {
			lookup.set(subject.value, { label: subject.label, icon: subject.icon });
		}
	}
	return lookup;
}

const SCHOOL_SUBJECT_META = buildSchoolSubjectMetaLookup();

function bumpCandidate(
	candidates: Map<string, PillCandidate>,
	candidate: PillCandidate,
) {
	const existing = candidates.get(candidate.pillKey);
	if (!existing || candidate.score > existing.score) {
		candidates.set(candidate.pillKey, candidate);
	}
}

function inferThemesFromText(text: string): string[] {
	return THEME_KEYWORD_PATTERNS.filter(({ pattern }) => pattern.test(text)).map(
		({ theme }) => theme,
	);
}

function shortCustomLabel(text: string, maxLength = 28): string {
	const firstClause = text.split(/[,;.]/)[0]?.trim() ?? text;
	if (firstClause.length <= maxLength) {
		return firstClause;
	}
	return `${firstClause.slice(0, maxLength - 1)}…`;
}

function subjectJobDescription(subjectLabel: string): string {
	return `${subjectLabel}-Wissen wird in diesem Beruf regelmäßig gebraucht.`;
}

function bumpCustomMatchCandidate(
	candidates: Map<string, PillCandidate>,
	options: {
		text: string;
		score: number;
		pillKeyPrefix: string;
		summaryContentKey: ContentKey;
		icon?: string;
	},
) {
	const {
		text,
		score,
		pillKeyPrefix,
		summaryContentKey,
		icon = "✨",
	} = options;
	const themes = inferThemesFromText(text);
	if (themes.length > 0) {
		for (const theme of themes) {
			bumpCandidate(candidates, { pillKey: theme, score });
		}
		return;
	}
	bumpCandidate(candidates, {
		pillKey: `${pillKeyPrefix}-${text}`,
		score,
		labelOverride: shortCustomLabel(text),
		iconOverride: icon,
		summaryOverride: getContentString(summaryContentKey),
	});
}

function mapInterestSignal(
	signal: MatchSignal,
	candidates: Map<string, PillCandidate>,
) {
	if (signal.isCustom) {
		bumpCustomMatchCandidate(candidates, {
			text: signal.sourceId,
			score: signal.weight,
			pillKeyPrefix: "custom-interest",
			summaryContentKey: "results.detail.matchPills.customInterest.description",
		});
		return;
	}

	const themes = INTEREST_THEMES[signal.sourceId];
	if (themes?.length) {
		for (const theme of themes) {
			bumpCandidate(candidates, { pillKey: theme, score: signal.weight });
		}
		return;
	}

	bumpCandidate(candidates, {
		pillKey: `interest-${signal.sourceId}`,
		score: signal.weight,
		labelOverride:
			INTEREST_BY_ID.get(signal.sourceId)?.dataLabel ?? signal.sourceId,
		iconOverride: "✨",
		summaryOverride:
			content["results.detail.matchPills.interestFallback.description"],
	});
}

function mapStrengthSignal(
	signal: MatchSignal,
	candidates: Map<string, PillCandidate>,
) {
	if (signal.isCustom) {
		bumpCustomMatchCandidate(candidates, {
			text: signal.sourceId,
			score: signal.weight,
			pillKeyPrefix: "custom-strength",
			summaryContentKey: "results.detail.matchPills.customStrength.description",
			icon: "⭐",
		});
		return;
	}

	const theme = STRENGTH_THEMES[signal.sourceId];
	if (theme) {
		bumpCandidate(candidates, { pillKey: theme, score: signal.weight });
	}
}

function mapSubjectSignal(
	signal: MatchSignal,
	candidates: Map<string, PillCandidate>,
) {
	if (signal.isCustom) {
		const themes = inferThemesFromText(signal.sourceId);
		if (themes.length > 0) {
			for (const theme of themes) {
				bumpCandidate(candidates, { pillKey: theme, score: signal.weight });
			}
			return;
		}
		bumpCandidate(candidates, {
			pillKey: `fach-custom-${signal.sourceId}`,
			score: signal.weight,
			labelOverride: signal.sourceId,
			iconOverride: "📚",
			summaryOverride: subjectJobDescription(signal.sourceId),
		});
		return;
	}

	const theme = SUBJECT_THEMES[signal.sourceId];
	if (theme) {
		bumpCandidate(candidates, { pillKey: theme, score: signal.weight });
		return;
	}

	const meta = SCHOOL_SUBJECT_META.get(signal.sourceId);
	bumpCandidate(candidates, {
		pillKey: `fach-${signal.sourceId}`,
		score: signal.weight,
		labelOverride: meta?.label ?? signal.sourceId,
		iconOverride: meta?.icon ?? "📚",
		summaryOverride: subjectJobDescription(meta?.label ?? signal.sourceId),
	});
}

function mapExpectationSignal(
	signal: MatchSignal,
	candidates: Map<string, PillCandidate>,
) {
	if (signal.isCustom) {
		bumpCustomMatchCandidate(candidates, {
			text: signal.sourceId,
			score: signal.weight,
			pillKeyPrefix: "custom-expectation",
			summaryContentKey:
				"results.detail.matchPills.customExpectation.description",
			icon: "⭐",
		});
		return;
	}

	const theme = EXPECTATION_THEMES[signal.sourceId];
	if (theme) {
		bumpCandidate(candidates, { pillKey: theme, score: signal.weight });
	}
}

function mapWorkPrefSignal(
	signal: MatchSignal,
	candidates: Map<string, PillCandidate>,
) {
	const [prefId, choice] = signal.sourceId.split(":");
	if (!prefId || (choice !== "a" && choice !== "b")) {
		return;
	}
	const theme = WORK_PREF_THEMES[prefId]?.[choice];
	if (theme) {
		bumpCandidate(candidates, { pillKey: theme, score: signal.weight });
	}
}

function mapMatchSignalToCandidates(
	signal: MatchSignal,
	candidates: Map<string, PillCandidate>,
) {
	switch (signal.dimension) {
		case "interest":
			mapInterestSignal(signal, candidates);
			break;
		case "strength":
			mapStrengthSignal(signal, candidates);
			break;
		case "subject":
			mapSubjectSignal(signal, candidates);
			break;
		case "expectation":
			mapExpectationSignal(signal, candidates);
			break;
		case "workPref":
			mapWorkPrefSignal(signal, candidates);
			break;
		default:
			break;
	}
}

function getThemedPillMeta(
	pillKey: string,
): Pick<OccupationMatchPill, "label" | "icon" | "summary"> | null {
	const labelKey = `results.detail.matchPills.${pillKey}.label`;
	const iconKey = `results.detail.matchPills.${pillKey}.icon`;
	const descriptionKey = `results.detail.matchPills.${pillKey}.description`;
	if (
		!isContentKey(labelKey) ||
		!isContentKey(iconKey) ||
		!isContentKey(descriptionKey)
	) {
		return null;
	}
	const label = getContentString(labelKey);
	if (!label) {
		return null;
	}
	return {
		label,
		icon: getContentString(iconKey),
		summary: getContentString(descriptionKey),
	};
}

function getNotMatchPillMeta(
	id: string,
): Pick<OccupationMatchPill, "label" | "icon" | "summary"> {
	const labelKey = `results.detail.notMatchPills.${id}.label`;
	const iconKey = `results.detail.notMatchPills.${id}.icon`;
	const descriptionKey = `results.detail.notMatchPills.${id}.description`;
	if (
		!isContentKey(labelKey) ||
		!isContentKey(iconKey) ||
		!isContentKey(descriptionKey)
	) {
		return {
			label: id,
			icon: "⚠️",
			summary: getContentString(
				"results.detail.notMatchPills.custom.description",
			),
		};
	}
	return {
		label: getContentString(labelKey),
		icon: getContentString(iconKey),
		summary: getContentString(descriptionKey),
	};
}

function candidateToPill(candidate: PillCandidate): OccupationMatchPill | null {
	const themed = getThemedPillMeta(candidate.pillKey);
	if (themed) {
		return {
			id: `match-${candidate.pillKey}`,
			...themed,
			score: candidate.score,
		};
	}
	if (!candidate.labelOverride || !candidate.summaryOverride) {
		return null;
	}
	return {
		id: `match-${candidate.pillKey}`,
		label: candidate.labelOverride,
		icon: candidate.iconOverride ?? "✨",
		summary: candidate.summaryOverride,
		score: candidate.score,
	};
}

function buildMatchingPills(
	profile: UserProfile,
	occupation: Occupation,
): OccupationMatchPill[] {
	const candidates = new Map<string, PillCandidate>();
	const { matching } = collectMatchSignals(profile, occupation);

	for (const signal of matching) {
		mapMatchSignalToCandidates(signal, candidates);
	}

	return [...candidates.values()]
		.map(candidateToPill)
		.filter((pill): pill is OccupationMatchPill => pill !== null);
}

function mapNotMatchSignalToPill(signal: MatchSignal): OccupationMatchPill {
	if (signal.isCustom) {
		return {
			id: `not-match-custom-${signal.sourceId}`,
			label: shortCustomLabel(signal.sourceId),
			icon: "⛔",
			summary: content["results.detail.notMatchPills.custom.description"],
			score: signal.weight,
		};
	}

	return {
		id: `not-match-${signal.sourceId}`,
		...getNotMatchPillMeta(signal.sourceId),
		score: signal.weight,
	};
}

function buildNotMatchingPills(
	profile: UserProfile,
	occupation: Occupation,
): OccupationMatchPill[] {
	const { notMatching } = collectMatchSignals(profile, occupation);
	return notMatching.map(mapNotMatchSignalToPill);
}

function dedupePillsById(pills: OccupationMatchPill[]): OccupationMatchPill[] {
	const byId = new Map<string, OccupationMatchPill>();
	for (const pill of pills) {
		const existing = byId.get(pill.id);
		if (!existing || pill.score > existing.score) {
			byId.set(pill.id, pill);
		}
	}
	return [...byId.values()];
}

function takeTopPills(pills: OccupationMatchPill[]): OccupationMatchPill[] {
	return dedupePillsById(pills)
		.sort((a, b) => b.score - a.score)
		.slice(0, MAX_PILLS);
}

export function buildOccupationMatchPills(
	profile: UserProfile,
	occupation: Occupation,
): OccupationMatchPillGroups {
	return {
		matching: takeTopPills(buildMatchingPills(profile, occupation)),
		notMatching: takeTopPills(buildNotMatchingPills(profile, occupation)),
	};
}
