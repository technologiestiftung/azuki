import type { Occupation, UserProfile } from "../types";
import {
	NO_GO_MAP,
	occupationHasOutdoorWork,
	type OccupationPredicate,
} from "./predicates";

export const NO_GO_TO_PILL_ID: Record<string, string> = {
	noise: "laerm",
	dirt: "schmutz",
	"heavy-work": "schwerstarbeit",
	computer: "computer",
	"shift-work": "schichten",
	animals: "tiere",
	danger: "gefahr",
};

const CUSTOM_NO_GO_THEME_HINTS: { pillId: string; pattern: RegExp }[] = [
	{ pillId: "schmutz", pattern: /schmutz|dreck|sauber/i },
	{ pillId: "laerm", pattern: /lärm|laut/i },
	{ pillId: "schichten", pattern: /schicht|nacht|wochenende/i },
	{ pillId: "gefahr", pattern: /gefahr|risiko|unsicher/i },
	{ pillId: "computer", pattern: /bildschirm|computer|sitzen/i },
	{ pillId: "schwerstarbeit", pattern: /schwer|heben|tragen|körperlich/i },
	{ pillId: "tiere", pattern: /tier|stall/i },
	{ pillId: "natur", pattern: /draußen|wetter|kälte|regen/i },
];

const NOT_MATCH_PILL_OCCUPATION_CHECKS: Record<string, OccupationPredicate> = {
	schmutz: NO_GO_MAP.dirt,
	laerm: NO_GO_MAP.noise,
	schichten: NO_GO_MAP["shift-work"],
	gefahr: NO_GO_MAP.danger,
	computer: NO_GO_MAP.computer,
	schwerstarbeit: NO_GO_MAP["heavy-work"],
	tiere: NO_GO_MAP.animals,
	natur: occupationHasOutdoorWork,
};

export function inferNotMatchPillIdFromText(text: string): string | null {
	for (const hint of CUSTOM_NO_GO_THEME_HINTS) {
		if (hint.pattern.test(text)) {
			return hint.pillId;
		}
	}
	return null;
}

export function occupationMatchesNotMatchPill(
	pillId: string,
	occupation: Occupation,
): boolean {
	return NOT_MATCH_PILL_OCCUPATION_CHECKS[pillId]?.(occupation) ?? false;
}

export function profilePrefersIndoors(profile: UserProfile): boolean {
	return (
		profile.workPreferences.location === "a" ||
		profile.workPreferences.environment === "a"
	);
}
