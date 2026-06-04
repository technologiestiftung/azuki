/** Stable id for filter chips and API payloads. */
export type OccupationTagId =
	| "bauen-handwerk"
	| "maschinen-fahrzeuge"
	| "elektro-energie"
	| "computer-it"
	| "labor-forschung"
	| "pflanzen-tiere-umwelt"
	| "essen-gastronomie"
	| "gesundheit"
	| "soziales-betreuen"
	| "verkaufen-beraten"
	| "buero-verwaltung-logistik"
	| "beauty-fitness"
	| "kreatives-gestaltung"
	| "sonstige";

export interface OccupationTagDefinition {
	id: OccupationTagId;
	label: string;
}

/** Display order for filter chips and badges. */
export const OCCUPATION_TAGS: readonly OccupationTagDefinition[] = [
	{ id: "bauen-handwerk", label: "Bauen & Handwerk" },
	{ id: "maschinen-fahrzeuge", label: "Maschinen & Fahrzeuge" },
	{ id: "elektro-energie", label: "Elektro & Energie" },
	{ id: "computer-it", label: "Computer & IT" },
	{ id: "labor-forschung", label: "Labor & Forschung" },
	{ id: "pflanzen-tiere-umwelt", label: "Pflanzen, Tiere & Umwelt" },
	{ id: "essen-gastronomie", label: "Essen & Gastronomie" },
	{ id: "gesundheit", label: "Gesundheit" },
	{ id: "soziales-betreuen", label: "Soziales & Betreuen" },
	{ id: "verkaufen-beraten", label: "Verkaufen & Beraten" },
	{ id: "buero-verwaltung-logistik", label: "Büro, Verwaltung & Logistik" },
	{ id: "beauty-fitness", label: "Beauty & Fitness" },
	{ id: "kreatives-gestaltung", label: "Kreatives & Gestaltung" },
	{ id: "sonstige", label: "Sonstige" },
] as const;

export const OCCUPATION_TAG_BY_ID = new Map(
	OCCUPATION_TAGS.map((tag) => [tag.id, tag]),
);

const FALLBACK_TAG: OccupationTagId = "sonstige";

/** KldB 2010 Berufshauptgruppe (2-digit) → youth-facing sector tag. */
const KLDB_2_DIGIT_TO_TAG: Record<string, OccupationTagId> = {
	"01": "sonstige",
	"11": "pflanzen-tiere-umwelt",
	"12": "pflanzen-tiere-umwelt",
	"21": "bauen-handwerk",
	"22": "bauen-handwerk",
	"23": "kreatives-gestaltung",
	"24": "bauen-handwerk",
	"25": "maschinen-fahrzeuge",
	"26": "elektro-energie",
	"27": "labor-forschung",
	"28": "bauen-handwerk",
	"29": "essen-gastronomie",
	"31": "bauen-handwerk",
	"32": "bauen-handwerk",
	"33": "bauen-handwerk",
	"34": "bauen-handwerk",
	"41": "labor-forschung",
	"42": "pflanzen-tiere-umwelt",
	"43": "computer-it",
	"51": "buero-verwaltung-logistik",
	"52": "buero-verwaltung-logistik",
	"53": "sonstige",
	"54": "sonstige",
	"61": "verkaufen-beraten",
	"62": "verkaufen-beraten",
	"63": "essen-gastronomie",
	"71": "buero-verwaltung-logistik",
	"72": "buero-verwaltung-logistik",
	"73": "buero-verwaltung-logistik",
	"81": "gesundheit",
	"82": "gesundheit",
	"83": "soziales-betreuen",
	"84": "soziales-betreuen",
	"91": "kreatives-gestaltung",
	"92": "kreatives-gestaltung",
	"93": "kreatives-gestaltung",
	"94": "kreatives-gestaltung",
};

/** Finer splits where a 2-digit group spans multiple youth-facing tags. */
const KLDB_3_DIGIT_TO_TAG: Record<string, OccupationTagId> = {
	"821": "gesundheit",
	"822": "beauty-fitness",
	"823": "beauty-fitness",
	"824": "sonstige",
	"825": "gesundheit",
	"841": "soziales-betreuen",
	"842": "kreatives-gestaltung",
	"844": "kreatives-gestaltung",
	"845": "beauty-fitness",
};

/**
 * Maps a KldB 2010 code (5-digit occupation type) to a sector tag.
 * Falls back to {@link FALLBACK_TAG} when the code is missing or unknown.
 */
export function resolveOccupationTag(
	germanOccupationCode: string | null | undefined,
): OccupationTagId {
	if (!germanOccupationCode) {
		return FALLBACK_TAG;
	}

	const digits = germanOccupationCode.replace(/\D/g, "");
	if (digits.length < 2) {
		return FALLBACK_TAG;
	}

	if (digits.length >= 3) {
		const prefix3 = digits.slice(0, 3);
		const override3 = KLDB_3_DIGIT_TO_TAG[prefix3];
		if (override3) {
			return override3;
		}
	}

	const prefix2 = digits.slice(0, 2);
	return KLDB_2_DIGIT_TO_TAG[prefix2] ?? FALLBACK_TAG;
}

export function getOccupationTagDefinition(
	tagId: string,
): OccupationTagDefinition | undefined {
	return OCCUPATION_TAG_BY_ID.get(tagId as OccupationTagId);
}
