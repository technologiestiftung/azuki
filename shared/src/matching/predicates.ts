import type { Occupation } from "../types";

export type OccupationPredicate = (occupation: Occupation) => boolean;
export type WorkPreferenceOptionChecks = {
	a: OccupationPredicate;
	b: OccupationPredicate;
};
export type WorkExpectationPredicate = (occupation: Occupation) => boolean;

/** BERUFENET b20-2 skill tags that indicate creativity. */
export const CREATIVITY_SKILL_TAGS: readonly string[] = [
	"Sinn und Gespür für Ästhetik",
	"Zeichnerische Befähigung",
] as const;

/** BERUFENET b20-4 strength tag for creativity. */
export const CREATIVITY_STRENGTH_TAG = "Kreativität";

/** Occupations with kreativ-gestaltend interest, Kreativität strength, or creativity skill tags. */
export function hasCreativitySignal(occupation: Occupation): boolean {
	return (
		occupation.interests.includes("kreativ-gestaltend") ||
		occupation.strengthTags.includes(CREATIVITY_STRENGTH_TAG) ||
		CREATIVITY_SKILL_TAGS.some((tag) => occupation.skillTags.includes(tag))
	);
}

export function occupationHasOutdoorWork(occupation: Occupation): boolean {
	return (
		occupation.conditions.outdoor || occupation.conditions.constructionSite
	);
}

export const NO_GO_MAP: Record<string, OccupationPredicate> = {
	noise: (occupation) => occupation.conditions.noise,
	dirt: (occupation) => occupation.conditions.dirt,
	"heavy-work": (occupation) => occupation.conditions.heavyLifting,
	computer: (occupation) => occupation.conditions.screenWork,
	"shift-work": (occupation) => occupation.conditions.shiftWork,
	animals: (occupation) => occupation.conditions.animalWork,
	danger: (occupation) => occupation.conditions.accidentRisk,
};

export const WORK_PREF_MAP: Record<string, WorkPreferenceOptionChecks> = {
	location: {
		a: (occupation) => occupation.conditions.indoor,
		b: (occupation) =>
			occupation.conditions.outdoor || occupation.conditions.constructionSite,
	},
	"hands-vs-mind": {
		a: (occupation) =>
			occupation.conditions.manualLabor || occupation.conditions.machinery,
		b: (occupation) =>
			occupation.conditions.screenWork || occupation.conditions.office,
	},
	variety: {
		a: (occupation) => !occupation.conditions.changingTasks,
		b: (occupation) => occupation.conditions.changingTasks,
	},
	people: {
		a: (occupation) => !occupation.conditions.customerContact,
		b: (occupation) =>
			occupation.conditions.customerContact || occupation.conditions.teamwork,
	},
	pace: {
		a: () => false,
		b: (occupation) => occupation.conditions.office,
	},
	structure: {
		a: (occupation) => !hasCreativitySignal(occupation),
		b: hasCreativitySignal,
	},
	environment: {
		a: (occupation) => occupation.conditions.indoor,
		b: (occupation) => occupation.conditions.outdoor,
	},
};

export const STRENGTH_TO_TAGS: Record<string, string[]> = {
	teamwork: ["Befähigung zu Gruppenarbeit / Teamfähigkeit"],
	"logical-thinking": ["Umsicht"],
	creativity: [CREATIVITY_STRENGTH_TAG],
	craftsmanship: [],
	communication: ["Kommunikationsfähigkeit", "Kontaktbereitschaft"],
	empathy: ["Einfühlungsvermögen"],
	precision: [],
	concentration: [],
	perseverance: [
		"Durchhaltevermögen/Zielstrebigkeit",
		"Leistungs- und Einsatzbereitschaft",
	],
};

export const CONCENTRATION_SKILL_TAGS: readonly string[] = [
	"Konzentration",
	"Daueraufmerksamkeit",
] as const;

export const PRECISION_SKILL_TAGS: readonly string[] = [
	"Beobachtungsgenauigkeit",
] as const;

export const CRAFTSMANSHIP_SKILL_TAGS: readonly string[] = [
	"Fingergeschick",
] as const;

export const LOGICAL_THINKING_SKILL_TAGS: readonly string[] = [
	"Numerisches (rechnerisches) Denken",
] as const;

export const COMMUNICATION_SKILL_TAGS: readonly string[] = [
	"Mündliches Ausdrucksvermögen",
	"Schriftliches Ausdrucksvermögen und Rechtschreibsicherheit",
] as const;

const HOMEOFFICE_RE = /homeoffice/i;

export const WORK_EXPECTATIONS_CHECKS: Record<
	string,
	WorkExpectationPredicate
> = {
	people_work: (occupation) =>
		occupation.conditions.customerContact ||
		occupation.interests.includes("sozial-beratend"),
	teamwork_value: (occupation) =>
		occupation.conditions.teamwork ||
		occupation.strengthTags.includes(
			"Befähigung zu Gruppenarbeit / Teamfähigkeit",
		),
	autonomy_responsibility: (occupation) =>
		occupation.strengthTags.includes("Selbstständige Arbeitsweise") ||
		occupation.strengthTags.includes(
			"Verantwortungsbewusstsein und -bereitschaft",
		),
	flexible_hours: () => false,
	stability: (occupation) =>
		occupation.conditions.regulatedWork &&
		!occupation.conditions.accidentRisk &&
		!occupation.conditions.irregularHours,
	modern_technology: (occupation) =>
		occupation.conditions.machinery || occupation.digitalizationSignal,
	remote: (occupation) => HOMEOFFICE_RE.test(occupation.workLocations),
};
