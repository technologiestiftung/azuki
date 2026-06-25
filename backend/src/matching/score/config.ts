import type { Occupation } from "@azuki/shared";

export type OccupationPredicate = (occupation: Occupation) => boolean;
export type WorkPreferenceOptionChecks = {
	a: OccupationPredicate;
	b: OccupationPredicate;
};
export type WorkExpectationPredicate = (occupation: Occupation) => boolean;

export const NO_GO_MAP: Record<string, OccupationPredicate> = {
	noise: (o) => o.conditions.noise,
	dirt: (o) => o.conditions.dirt,
	"heavy-work": (o) => o.conditions.heavyLifting,
	computer: (o) => o.conditions.screenWork,
	"shift-work": (o) => o.conditions.shiftWork,
	// Keep ids aligned with frontend no-go cards.
	animals: (o) => o.conditions.animalWork,
	danger: (o) => o.conditions.accidentRisk,
};

export const WORK_PREF_MAP: Record<string, WorkPreferenceOptionChecks> = {
	location: {
		// "Fester Arbeitsort" — a stable indoor workplace covers retail,
		// warehouse, kitchen, salon, practice room etc. The older
		// office||workshop proxy missed all of those.
		a: (o) => o.conditions.indoor,
		b: (o) => o.conditions.outdoor || o.conditions.constructionSite,
	},
	"hands-vs-mind": {
		a: (o) => o.conditions.manualLabor || o.conditions.machinery,
		b: (o) => o.conditions.screenWork || o.conditions.office,
	},
	variety: {
		a: (o) => !o.conditions.changingTasks,
		b: (o) => o.conditions.changingTasks,
	},
	people: {
		a: (o) => !o.conditions.customerContact,
		b: (o) => o.conditions.customerContact || o.conditions.teamwork,
	},
	pace: {
		// BERUFENET b20-4: "Psychische Belastbarkeit" explicitly cites Zeitdruck
		a: (o) => o.strengthTags.includes("Psychische Belastbarkeit"),
		b: (o) =>
			!o.strengthTags.includes("Psychische Belastbarkeit") &&
			!o.conditions.shiftWork &&
			!o.conditions.irregularHours,
	},
	structure: {
		a: (o) => o.conditions.regulatedWork,
		b: (o) => !o.conditions.regulatedWork,
	},
	environment: {
		// "Drinnen" — any indoor workplace, not just office/workshop.
		a: (o) => o.conditions.indoor,
		b: (o) => o.conditions.outdoor,
	},
};

export const STRENGTH_TO_TAGS: Record<string, string[]> = {
	// Translates frontend strength ids to BERUFENET tags from b20-4.
	teamwork: ["Befähigung zu Gruppenarbeit / Teamfähigkeit"],
	"logical-thinking": ["Umsicht"],
	creativity: ["Kreativität"],
	// No b20-4 tags; scored via conditions fallback in dimensions.ts.
	craftsmanship: [],
	communication: ["Kommunikationsfähigkeit", "Kontaktbereitschaft"],
	// "Pädagogisches Geschick" lives in b20-2 skillTags, not b20-4, so we
	// only map the b20-4 tag here. 85/728 coverage — selective.
	empathy: ["Einfühlungsvermögen"],
	// Scored via conditions fallback (precisionWork) in dimensions.ts.
	precision: [],
	// Scored via skillTags fallback (b20-2) in dimensions.ts.
	concentration: [],
	perseverance: [
		"Durchhaltevermögen/Zielstrebigkeit",
		"Leistungs- und Einsatzbereitschaft",
	],
};

/** BERUFENET b20-2 skill tags that indicate concentration ability. */
export const CONCENTRATION_SKILL_TAGS: readonly string[] = [
	"Konzentration",
	"Daueraufmerksamkeit",
] as const;

/** BERUFENET b20-2 skill tags that indicate creativity. */
export const CREATIVITY_SKILL_TAGS: readonly string[] = [
	"Sinn und Gespür für Ästhetik",
	"Zeichnerische Befähigung",
] as const;

/** BERUFENET b20-2 skill tags that indicate precision. */
export const PRECISION_SKILL_TAGS: readonly string[] = [
	"Beobachtungsgenauigkeit",
] as const;

/** BERUFENET b20-2 skill tags that indicate craftsmanship. */
export const CRAFTSMANSHIP_SKILL_TAGS: readonly string[] = [
	"Fingergeschick",
] as const;

/** BERUFENET b20-2 skill tags that indicate logical thinking. */
export const LOGICAL_THINKING_SKILL_TAGS: readonly string[] = [
	"Numerisches (rechnerisches) Denken",
] as const;

/** BERUFENET b20-2 skill tags that indicate communication ability. */
export const COMMUNICATION_SKILL_TAGS: readonly string[] = [
	"Mündliches Ausdrucksvermögen",
	"Schriftliches Ausdrucksvermögen und Rechtschreibsicherheit",
] as const;

const HOMEOFFICE_RE = /homeoffice/i;

export const WORK_EXPECTATIONS_CHECKS: Record<
	string,
	WorkExpectationPredicate
> = {
	people_work: (o) =>
		o.conditions.customerContact || o.interests.includes("sozial-beratend"),
	teamwork_value: (o) =>
		o.conditions.teamwork ||
		o.strengthTags.includes("Befähigung zu Gruppenarbeit / Teamfähigkeit"),
	autonomy_responsibility: (o) =>
		o.strengthTags.includes("Selbstständige Arbeitsweise") ||
		o.strengthTags.includes("Verantwortungsbewusstsein und -bereitschaft"),
	// No BERUFENET signal for flexibility; delegated to LLM re-ranking.
	flexible_hours: () => false,
	stability: (o) =>
		o.conditions.regulatedWork &&
		!o.conditions.accidentRisk &&
		!o.conditions.irregularHours,
	modern_technology: (o) => o.conditions.machinery || o.digitalizationSignal,
	remote: (o) => HOMEOFFICE_RE.test(o.workLocations),
};
