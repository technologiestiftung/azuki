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
		matchKeywords: [
			"computer",
			"software",
			"system",
			"analyse",
			"problemlösung",
		],
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
		matchKeywords: [
			"fotografieren",
			"kamera",
			"bild",
			"aufnahme",
			"gestaltung",
		],
	},
	{
		id: "videos",
		dataLabel: "Videos",
		berufenetTags: ["kreativ-gestaltend"],
		// BERUFENET emits inflected/atomized tokens (`tonproduktionen`,
		// `kameras`, `mikrofonen`, `bild`, `bearbeiten`) rather than the
		// loanword "Video"/"Schnitt"/"Medien". Include the verbatim German
		// tokens that AV Berufe actually carry.
		matchKeywords: [
			"video",
			"aufnahme",
			"schnitt",
			"medien",
			"gestaltung",
			"bild",
			"ton",
			"kamera",
			"film",
			"audio",
		],
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
		matchKeywords: [
			"basteln",
			"anfertigen",
			"material",
			"gestaltung",
			"handwerk",
		],
	},
	{
		id: "fashion",
		dataLabel: "Mode",
		berufenetTags: ["kreativ-gestaltend"],
		matchKeywords: [
			"kleidungsstücken",
			"kleidungsstücke",
			"nähen",
			"zusammennähen",
			"textilien",
			"design",
		],
	},
	{
		id: "styling",
		dataLabel: "Styling",
		berufenetTags: ["kreativ-gestaltend"],
		matchKeywords: [
			"schminken",
			"frisieren",
			"haare",
			"kosmetika",
			"kosmetikprodukten",
			"stylen",
		],
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
		matchKeywords: [
			"montieren",
			"einbauen",
			"verschrauben",
			"schrauben",
			"werkzeugen",
		],
	},
	{
		id: "repairing",
		dataLabel: "Reparieren",
		berufenetTags: ["praktisch-konkret"],
		matchKeywords: [
			"reparieren",
			"reparaturen",
			"instandsetzen",
			"instandhalten",
			"warten",
			"defekten",
		],
	},
	{
		id: "baking",
		dataLabel: "Backen",
		berufenetTags: ["praktisch-konkret"],
		matchKeywords: [
			"backen",
			"teig",
			"lebensmittel",
			"zubereiten",
			"herstellen",
		],
	},
	{
		id: "cooking",
		dataLabel: "Kochen",
		berufenetTags: ["praktisch-konkret"],
		matchKeywords: [
			"kochen",
			"zubereiten",
			"lebensmittel",
			"gerichte",
			"küche",
		],
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
		id: "outdoors",
		dataLabel: "Draußen sein",
		berufenetTags: ["praktisch-konkret"],
		matchKeywords: ["draußen", "natur", "außenbereich", "einsatz", "bewegung"],
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
		matchKeywords: [
			"team",
			"zusammenarbeit",
			"abstimmung",
			"kommunikation",
			"gruppe",
		],
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
		matchKeywords: [
			"tanzen",
			"rhythmus",
			"bewegung",
			"choreografie",
			"auftritt",
		],
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
		matchKeywords: [
			"helfen",
			"unterstützen",
			"beraten",
			"betreuen",
			"einfühlsam",
		],
	},
	{
		id: "reading",
		dataLabel: "Lesen",
		berufenetTags: ["theoretisch-abstrakt"],
		matchKeywords: [
			"lesen",
			"text",
			"dokumentieren",
			"analysieren",
			"information",
		],
	},
	{
		id: "babysitting",
		dataLabel: "Mit Kindern sein",
		berufenetTags: ["sozial-beratend"],
		matchKeywords: ["kinder", "betreuen", "erziehen", "fördern", "einfühlsam"],
	},
	{
		id: "planning",
		dataLabel: "Events planen",
		berufenetTags: ["organisatorisch-pruefend", "kaufmännisch-organisatorisch"],
		matchKeywords: [
			"planen",
			"organisieren",
			"koordination",
			"ablauf",
			"kommunikation",
		],
	},
];
