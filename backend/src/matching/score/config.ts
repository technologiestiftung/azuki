import type { Occupation } from "@azuki/shared";

export type OccupationPredicate = (occupation: Occupation) => boolean;
export type WorkPreferenceOptionChecks = {
	a: OccupationPredicate;
	b: OccupationPredicate;
};
export type WorkValuePredicate = (occupation: Occupation) => boolean;

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
		a: (o) => o.conditions.office || o.conditions.workshop,
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
		a: (o) => o.conditions.office,
		// No BERUFENET signal for "Arbeit unter Zeitdruck".
		b: () => false,
	},
	structure: {
		a: (o) => o.conditions.regulatedWork,
		b: (o) => !o.conditions.regulatedWork,
	},
	purpose: {
		a: (o) => o.interests.includes("sozial-beratend"),
		// No BERUFENET signal for "Aufgaben erledigen".
		b: () => false,
	},
	environment: {
		a: (o) => o.conditions.office || o.conditions.workshop,
		b: (o) => o.conditions.outdoor,
	},
};

export const STRENGTH_TO_TAGS: Record<string, string[]> = {
	// Translates frontend strength ids to BERUFENET tags from b20-4.
	teamwork: ["Befähigung zu Gruppenarbeit / Teamfähigkeit"],
	"logical-thinking": ["Umsicht", "Sorgfalt"],
	creativity: ["Kreativität"],
	// No b20-4 tags; scored via conditions fallback in dimensions.ts.
	craftsmanship: [],
	communication: ["Kommunikationsfähigkeit", "Kontaktbereitschaft"],
	concentration: ["Sorgfalt"],
	precision: ["Sorgfalt"],
	perseverance: [
		"Durchhaltevermögen/Zielstrebigkeit",
		"Leistungs- und Einsatzbereitschaft",
	],
};

export const WORK_VALUE_CHECKS: Record<string, WorkValuePredicate> = {
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
	movement: (o) =>
		o.conditions.standingWalking || o.conditions.manualLabor || o.conditions.outdoor,
	//TODO: add conditions for short_distance, career, benefits, remote
};
