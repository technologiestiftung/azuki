export type Bundesland =
	| "Baden-Württemberg"
	| "Bayern"
	| "Berlin"
	| "Brandenburg"
	| "Bremen"
	| "Hamburg"
	| "Hessen"
	| "Mecklenburg-Vorpommern"
	| "Niedersachsen"
	| "Nordrhein-Westfalen"
	| "Rheinland-Pfalz"
	| "Saarland"
	| "Sachsen"
	| "Sachsen-Anhalt"
	| "Schleswig-Holstein"
	| "Thüringen";

export const BUNDESLAENDER: Bundesland[] = [
	"Baden-Württemberg",
	"Bayern",
	"Berlin",
	"Brandenburg",
	"Bremen",
	"Hamburg",
	"Hessen",
	"Mecklenburg-Vorpommern",
	"Niedersachsen",
	"Nordrhein-Westfalen",
	"Rheinland-Pfalz",
	"Saarland",
	"Sachsen",
	"Sachsen-Anhalt",
	"Schleswig-Holstein",
	"Thüringen",
];

export function isBundesland(s: string): s is Bundesland {
	return (BUNDESLAENDER as readonly string[]).includes(s);
}
