export interface Bedingungen {
	draussen: boolean;
	buero: boolean;
	werkstatt: boolean;
	baustelle: boolean;
	bildschirm: boolean;
	handarbeit: boolean;
	maschinen: boolean;
	laerm: boolean;
	schmutz: boolean;
	schweresHeben: boolean;
	hoehe: boolean;
	schichtarbeit: boolean;
	kundenkontakt: boolean;
	teamarbeit: boolean;
	stehenGehen: boolean;
}

export interface Schulabschluss {
	ohne: number;
	hauptschule: number;
	mittel: number;
	hochschulreife: number;
}

export interface BerufBild {
	url: string;
	unterschrift: string;
	bildgruppe: string;
}

export interface Beruf {
	id: number;
	name: string;
	steckbriefKurz: string | null;
	steckbriefLang: string | null;
	aufgabenKompakt: string | null;
	bilder: BerufBild[];
	schulabschluss: Schulabschluss | null;
	schulfaecher: string[];
	interessen: string[];
	bedingungen: Bedingungen;
	arbeitsorte: string;
	kompetenzenText: string;
}

export interface UserProfile {
	schulabschluss: string | null;
	lieblingsfaecher: string[];
	interessen: string[];
	customInteressen: string[];
	staerken: Record<string, number>;
	geheimesTalent: string;
	praktischeErfahrungen: string;
	arbeitsbedingungen: Record<string, string | null>;
	noGos: Record<string, string | null>;
}

export interface MatchedBeruf {
	id: number;
	name: string;
	score: number;
	bilder: BerufBild[];
	aufgabenKompakt: string;
	begruendung: string;
}

export interface MatchResult {
	berufe: MatchedBeruf[];
}
