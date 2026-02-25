import type { Beruf, UserProfile } from "../types.js";

const NO_GO_MAP: Record<string, (b: Beruf) => boolean> = {
	noise: (b) => b.bedingungen.laerm,
	dirt: (b) => b.bedingungen.schmutz,
	"heavy-work": (b) => b.bedingungen.schweresHeben,
	computer: (b) => b.bedingungen.bildschirm,
	"shift-work": (b) => b.bedingungen.schichtarbeit,
	animals: (b) => b.bedingungen.draussen,
	danger: (b) => b.bedingungen.hoehe,
};

const WORK_PREF_MAP: Record<
	string,
	{ a: (b: Beruf) => boolean; b: (b: Beruf) => boolean }
> = {
	location: {
		a: (b) => b.bedingungen.buero || b.bedingungen.werkstatt,
		b: (b) => b.bedingungen.draussen || b.bedingungen.baustelle,
	},
	"hands-vs-mind": {
		a: (b) => b.bedingungen.handarbeit,
		b: (b) => b.bedingungen.bildschirm || b.bedingungen.buero,
	},
	variety: {
		a: () => false,
		b: () => false,
	},
	people: {
		a: (b) => !b.bedingungen.kundenkontakt,
		b: (b) => b.bedingungen.kundenkontakt,
	},
	pace: {
		a: (b) => b.bedingungen.buero,
		b: () => false,
	},
	structure: {
		a: () => false,
		b: () => false,
	},
	purpose: {
		a: (b) => b.interessen.includes("sozial-beratend"),
		b: () => false,
	},
	environment: {
		a: (b) => b.bedingungen.buero || b.bedingungen.werkstatt,
		b: (b) => b.bedingungen.draussen,
	},
};

const HOBBY_TO_INTEREST: Record<string, string[]> = {
	Gaming: ["theoretisch-abstrakt"],
	Computer: ["theoretisch-abstrakt"],
	Fotografieren: ["kreativ-gestaltend"],
	Videos: ["kreativ-gestaltend"],
	Zeichnen: ["kreativ-gestaltend"],
	Musik: ["kreativ-gestaltend"],
	Basteln: ["kreativ-gestaltend", "praktisch-konkret"],
	Schreiben: ["kreativ-gestaltend"],
	Bauen: ["praktisch-konkret"],
	Reparieren: ["praktisch-konkret"],
	Kochen: ["praktisch-konkret"],
	"Gärtnern": ["praktisch-konkret"],
	Tiere: ["praktisch-konkret"],
	Wandern: ["praktisch-konkret"],
	Natur: ["praktisch-konkret"],
	Sport: ["praktisch-konkret"],
	"Anderen helfen": ["sozial-beratend"],
	Organisieren: ["organisatorisch-pruefend"],
	Verkaufen: ["sozial-beratend"],
	"Kinder betreuen": ["sozial-beratend"],
};

export function scoreBeruf(beruf: Beruf, profile: UserProfile): number {
	let score = 0;

	score += scoreSchulabschluss(beruf, profile);
	score += scoreNoGos(beruf, profile);
	score += scoreWorkPreferences(beruf, profile);
	score += scoreFaecher(beruf, profile);
	score += scoreInteressen(beruf, profile);

	return score;
}

function scoreSchulabschluss(beruf: Beruf, profile: UserProfile): number {
	if (!beruf.schulabschluss || !profile.schulabschluss) return 0;

	const sa = beruf.schulabschluss;

	switch (profile.schulabschluss) {
		case "hauptschule":
		case "erweitert_hauptschule":
			if (sa.hauptschule + sa.ohne < 10) return -10;
			break;
		case "realschule":
			if (sa.mittel + sa.hauptschule + sa.ohne < 10) return -5;
			break;
		case "ohne_abschluss":
			if (sa.ohne < 10) return -15;
			break;
		case "abitur":
			break;
	}

	return 0;
}

function scoreNoGos(beruf: Beruf, profile: UserProfile): number {
	let penalty = 0;
	for (const [id, answer] of Object.entries(profile.noGos)) {
		if (answer !== "geht_nicht") continue;
		const check = NO_GO_MAP[id];
		if (check && check(beruf)) {
			penalty -= 5;
		}
	}
	return penalty;
}

function scoreWorkPreferences(beruf: Beruf, profile: UserProfile): number {
	let score = 0;
	for (const [id, choice] of Object.entries(profile.arbeitsbedingungen)) {
		if (!choice) continue;
		const mapping = WORK_PREF_MAP[id];
		if (!mapping) continue;

		const checkFn = choice === "a" ? mapping.a : mapping.b;
		if (checkFn(beruf)) score += 2;
	}
	return score;
}

function scoreFaecher(beruf: Beruf, profile: UserProfile): number {
	let score = 0;
	for (const fach of profile.lieblingsfaecher) {
		if (beruf.schulfaecher.includes(fach)) {
			score += 1;
		}
	}
	return score;
}

function scoreInteressen(beruf: Beruf, profile: UserProfile): number {
	let score = 0;

	const userCategories = new Set<string>();
	for (const interest of profile.interessen) {
		const cats = HOBBY_TO_INTEREST[interest];
		if (cats) {
			for (const c of cats) userCategories.add(c);
		}
	}

	for (const cat of userCategories) {
		const idx = beruf.interessen.indexOf(cat);
		if (idx === 0) score += 3;
		else if (idx === 1) score += 2;
		else if (idx >= 2) score += 1;
	}

	return score;
}
