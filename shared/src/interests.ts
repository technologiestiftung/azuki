export interface InterestDefinition {
	id: string;
	dataLabel: string;
	berufenetTags: string[];
	matchKeywords: string[];
}

export const INTERESTS: InterestDefinition[] = [
	{
		id: "gaming",
		dataLabel: "Gaming",
		berufenetTags: ["theoretisch-abstrakt"],
		matchKeywords: ["computer", "software", "system", "analyse", "problemlösung"],
	},
	{
		id: "computer",
		dataLabel: "Computer",
		berufenetTags: ["theoretisch-abstrakt"],
		matchKeywords: ["computer", "software", "system", "programm", "daten"],
	},
	{
		id: "photography",
		dataLabel: "Fotografieren",
		berufenetTags: ["kreativ-gestaltend"],
		matchKeywords: ["fotografieren", "kamera", "bild", "aufnahme", "gestaltung"],
	},
	{
		id: "videos",
		dataLabel: "Videos",
		berufenetTags: ["kreativ-gestaltend"],
		matchKeywords: ["video", "aufnahme", "schnitt", "medien", "gestaltung"],
	},
	{
		id: "drawing",
		dataLabel: "Zeichnen",
		berufenetTags: ["kreativ-gestaltend"],
		matchKeywords: ["zeichnen", "entwurf", "skizze", "gestaltung", "kreativ"],
	},
	{
		id: "painting",
		dataLabel: "Malen",
		berufenetTags: ["kreativ-gestaltend"],
		matchKeywords: ["malen", "farbe", "gestaltung", "oberfläche", "kreativ"],
	},
	{
		id: "music",
		dataLabel: "Musik",
		berufenetTags: ["kreativ-gestaltend"],
		matchKeywords: ["musik", "audio", "rhythmus", "klang", "aufnahme"],
	},
	{
		id: "crafting",
		dataLabel: "Basteln",
		berufenetTags: ["kreativ-gestaltend", "praktisch-konkret"],
		matchKeywords: ["basteln", "anfertigen", "material", "gestaltung", "handwerk"],
	},
	{
		id: "fashion",
		dataLabel: "Mode & styling",
		berufenetTags: ["kreativ-gestaltend"],
		matchKeywords: ["mode", "styling", "kleidung", "design", "beratung"],
	},
	{
		id: "building",
		dataLabel: "Bauen",
		berufenetTags: ["praktisch-konkret"],
		matchKeywords: ["bauen", "montieren", "bauteile", "werkzeug", "anlage"],
	},
	{
		id: "screwing",
		dataLabel: "Schrauben",
		berufenetTags: ["praktisch-konkret"],
		matchKeywords: ["montieren", "einbauen", "reparieren", "werkzeug", "warten"],
	},
	{
		id: "baking",
		dataLabel: "Backen",
		berufenetTags: ["praktisch-konkret"],
		matchKeywords: ["backen", "teig", "lebensmittel", "zubereiten", "herstellen"],
	},
	{
		id: "cooking",
		dataLabel: "Kochen",
		berufenetTags: ["praktisch-konkret"],
		matchKeywords: ["kochen", "zubereiten", "lebensmittel", "gerichte", "küche"],
	},
	{
		id: "gardening",
		dataLabel: "Gärtnern",
		berufenetTags: ["praktisch-konkret"],
		matchKeywords: ["pflanzen", "garten", "pflege", "boden", "anbau"],
	},
	{
		id: "animals",
		dataLabel: "Mit Tieren sein",
		berufenetTags: ["praktisch-konkret", "sozial-beratend"],
		matchKeywords: ["tiere", "tier", "füttern", "pflege", "betreuen"],
	},
	{
		id: "hiking",
		dataLabel: "Wandern",
		berufenetTags: ["praktisch-konkret"],
		matchKeywords: ["draußen", "natur", "bewegung", "gelände", "weg"],
	},
	{
		id: "camping",
		dataLabel: "Camping",
		berufenetTags: ["praktisch-konkret"],
		matchKeywords: ["draußen", "natur", "ausrüstung", "aufbauen", "reise"],
	},
	{
		id: "outdoors",
		dataLabel: "Draußen sein",
		berufenetTags: ["praktisch-konkret"],
		matchKeywords: ["draußen", "natur", "außenbereich", "einsatz", "bewegung"],
	},
	{
		id: "fishing",
		dataLabel: "Angeln",
		berufenetTags: ["praktisch-konkret"],
		matchKeywords: ["fisch", "wasser", "tier", "versorgung", "natur"],
	},
	{
		id: "gym",
		dataLabel: "Fitness",
		berufenetTags: ["praktisch-konkret"],
		matchKeywords: ["fitness", "training", "bewegung", "körper", "anleiten"],
	},
	{
		id: "team",
		dataLabel: "Teamsport",
		berufenetTags: ["sozial-beratend"],
		matchKeywords: ["team", "zusammenarbeit", "abstimmung", "kommunikation", "gruppe"],
	},
	{
		id: "martialArts",
		dataLabel: "Kampfsport",
		berufenetTags: ["praktisch-konkret"],
		matchKeywords: ["training", "technik", "körper", "disziplin", "bewegung"],
	},
	{
		id: "dancing",
		dataLabel: "Tanzen",
		berufenetTags: ["kreativ-gestaltend", "praktisch-konkret"],
		matchKeywords: ["tanzen", "rhythmus", "bewegung", "choreografie", "auftritt"],
	},
	{
		id: "cycling",
		dataLabel: "Radfahren",
		berufenetTags: ["praktisch-konkret"],
		matchKeywords: ["rad", "bewegung", "ausdauer", "draußen", "strecke"],
	},
	{
		id: "skating",
		dataLabel: "Skaten",
		berufenetTags: ["praktisch-konkret"],
		matchKeywords: ["bewegung", "technik", "körper", "balance", "draußen"],
	},
	{
		id: "helping",
		dataLabel: "Anderen helfen",
		berufenetTags: ["sozial-beratend"],
		matchKeywords: ["helfen", "unterstützen", "beraten", "betreuen", "einfühlsam"],
	},
	{
		id: "reading",
		dataLabel: "Lesen",
		berufenetTags: ["theoretisch-abstrakt"],
		matchKeywords: ["lesen", "text", "dokumentieren", "analysieren", "information"],
	},
	{
		id: "babysitting",
		dataLabel: "Babysitten",
		berufenetTags: ["sozial-beratend"],
		matchKeywords: ["kinder", "betreuen", "erziehen", "fördern", "einfühlsam"],
	},
	{
		id: "petCare",
		dataLabel: "Haustiere pflegen",
		berufenetTags: ["sozial-beratend", "praktisch-konkret"],
		matchKeywords: ["pflege", "organisieren", "struktur", "versorgung", "tiere"],
	},
	{
		id: "planning",
		dataLabel: "Party planen",
		berufenetTags: ["organisatorisch-pruefend", "kaufmännisch-organisatorisch"],
		matchKeywords: ["planen", "organisieren", "koordination", "ablauf", "kommunikation"],
	},
];
