import type { PersonaRubric } from "./types";
import {
	minTierSInTop8,
	noTierCInTop8,
	firstResultFromSet,
	atLeastOneOfPopularityTier,
} from "./criteria";
import { UNIVERSAL_NICHE_BAIT } from "./universal-niche-bait";

// Persona: Karim A. Source rubric: tools/eval-rubrics/karim.md (v1).
// 21, refugee from Lebanon (2015), no German Schulabschluss, A2 German.
// Target: Logistik or Einzelhandel. Key signals: team-oriented, no computer.

const tierS: number[] = [
	/* Verkäufer/in */ 6628,
	/* Fachkraft - Lagerlogistik */ 27448,
	/* Fachlagerist/in */ 27539,
	/* Fachpraktiker/in für Lagerlogistik (§66 BBiG/§42r HwO) */ 4708,
	/* Fachpraktiker/in im Verkauf (§66 BBiG/§42r HwO) */ 6649,
	/* Koch/Köchin */ 3726,
];

const tierA: number[] = [
	/* Kaufmann/-frau - Einzelhandel */ 6580,
	/* Hotelfachmann/-frau */ 10009,
	/* Fachverkäufer/in - Lebensmittelhandwerk (Bäckerei) */ 50920,
	/* Fachverkäufer/in - Lebensmittelhandwerk (Fleischerei) */ 50924,
	/* Fachverkäufer/in - Lebensmittelhandwerk (Konditorei) */ 50922,
	// Author note: "Maler/in und Lackierer/in (Ausbautechnik / Gestaltung)" —
	// the rubric distinguishes the gentler variants from the heavy Bauten-/
	// Korrosionsschutz one. Including all Fachrichtungen because the rubric
	// only soft-excludes the heavy variant; all are Tier A for Karim.
	/* Maler/in und Lackierer/in - Ausbautechnik und Oberflächengestaltung */ 134955,
	/* Maler/in und Lackierer/in - Bauten- und Korrosionsschutz */ 15532,
	/* Maler/in und Lackierer/in - Energieeffizienz- und Gestaltungstechnik */ 134954,
	/* Maler/in und Lackierer/in - Gestaltung und Instandhaltung */ 15530,
	/* Maler/in und Lackierer/in - Kirchenmalerei und Denkmalpflege */ 15534,
	/* Berufskraftfahrer/in */ 13794,
	/* Fachkraft - Schutz und Sicherheit */ 14463,
	/* Bäcker/in */ 3626,
	/* Fleischer/in */ 13804,
	/* Fachkraft - Gastronomie */ 136126,
	/* Fachpraktiker/in im Gastgewerbe (§66 BBiG/§42r HwO) */ 10088,
	/* Fachpraktiker/in im Nahrungsmittelverkauf (§66 BBiG/§42r HwO) */ 14818,
	/* Fachpraktiker/in Küche (Beikoch) (§66 BBiG/§42r HwO) */ 3747,
	// Author note: "Fachpraktiker/in für Möbel-, Küchen- und Umzugsservice" —
	// classified as Tier A (not S) because the rubric marks it as a "strong-pass
	// signal" but doesn't require it. Using the §66 variant (77408) as the
	// relevant entry for foreign-degree learners.
	/* Fachpraktiker/in für Möbel-, Küchen- und Umzugsservice (§66BBiG/§42rHwO) */ 77408,
	/* Fachkraft - Möbel-, Küchen- und Umzugsservice */ 34980,
];

// Persona-specific Tier C entries (beyond universal niche bait).
const personaSpecificTierC: number[] = [
	// --- His explicit noGo: computer-heavy roles ---
	/* Kaufmann/-frau - Büromanagement */ 123266,
	/* Industriekaufmann/-frau */ 7965,
	/* Bankkaufmann/-frau */ 6755,
	/* Steuerfachangestellte/r */ 7573,
	/* Verwaltungsfachangestellte/r - Bundesverwaltung */ 7934,
	/* Verwaltungsfachangestellte/r - HWK und IHK */ 7933,
	/* Verwaltungsfachangestellte/r - Kirchenverwaltung - evangelische Kirche */ 7929,
	/* Verwaltungsfachangestellte/r - Kommunalverwaltung */ 7944,
	/* Verwaltungsfachangestellte/r - Landesverwaltung */ 7925,
	/* Justizfachangestellte/r */ 7924,
	/* Medizinische/r Fachangestellte/r */ 33212,
	/* Zahnmedizinische/r Fachangestellte/r */ 14704,
	/* Tiermedizinische/r Fachangestellte/r */ 33214,
	/* Mediengestalter/in - Bild und Ton */ 8533,
	/* Mediengestalter/in Digital und Print - Designkonzeption */ 137684,
	/* Mediengestalter/in Digital und Print - Digitalmedien */ 137682,
	/* Mediengestalter/in Digital und Print - Printmedien */ 137683,
	/* Mediengestalter/in Digital und Print - Projektmanagement */ 137685,
	/* Designer/in (Ausbildung) - angewandte Formgebung, Schmuck und Gerät */ 14557,
	/* Designer/in (Ausbildung) - Foto */ 14326,
	/* Designer/in (Ausbildung) - Grafik */ 14217,
	/* Designer/in (Ausbildung) - Kommunikationsdesign */ 13968,
	/* Designer/in (Ausbildung) - Medien */ 8459,
	/* Designer/in (Ausbildung) - Mode */ 14319,
	/* Technische/r Produktdesigner/in - Maschinen- und Anlagenkonstruktion */ 90571,
	/* Technische/r Produktdesigner/in - Produktgestaltung und -konstruktion */ 90588,
	/* Fachinformatiker/in - Anwendungsentwicklung */ 7856,
	/* Fachinformatiker/in - Daten- und Prozessanalyse */ 133556,
	/* Fachinformatiker/in - Digitale Vernetzung */ 133560,
	/* Fachinformatiker/in - Systemintegration */ 7847,
	/* IT-System-Elektroniker/in */ 2927,
	/* Sozialversicherungsfachangestellte/r - allgemeine Krankenversicherung */ 7930,
	/* Sozialversicherungsfachangestellte/r - knappschaftliche Sozialversicherung */ 7936,
	/* Sozialversicherungsfachangestellte/r - landwirtschaftliche Sozialversicherung */ 7946,
	/* Sozialversicherungsfachangestellte/r - Rentenversicherung */ 7931,
	/* Sozialversicherungsfachangestellte/r - Unfallversicherung */ 7932,
	/* Rechtsanwaltsfachangestellte/r */ 7958,
	/* Kaufmann/-frau - Marketingkommunikation */ 35279,
	/* Kaufmann/-frau - Dialogmarketing */ 35311,
	/* Kaufmann/-frau - Spedition und Logistikdienstleistung */ 29441,

	// --- Education / language barrier mismatch ---
	/* Erzieher/in */ 9162,
	/* Erzieher/in - Jugend- und Heimerziehung */ 9106,
	/* Sozialpädagogische/r Assistent/in / Kinderpfleger/in */ 9170,
	/* Pflegefachmann/-frau (Ausbildung) */ 132173,
	/* Physiotherapeut/in (Ausbildung) */ 8750,
	/* Ergotherapeut/in (Ausbildung) */ 8779,
	/* Logopäde/Logopädin (Ausbildung) */ 8764,
	/* Notfallsanitäter/in */ 122462,
	/* Technische/r Assistent/in - Automatisierungstechnik */ 14302,
	/* Technische/r Assistent/in - Bautechnik */ 5620,
	/* Technische/r Assistent/in - medizinische Gerätetechnik */ 2874,
	/* Technische/r Assistent/in - Metallografie und Werkstoffkunde */ 6379,
	/* Technische/r Assistent/in - naturkundliche Museen und Forschungsinstitute */ 13625,
	/* Technische/r Assistent/in - regenerative Energietechnik und Energiemanagement */ 33197,
	/* Bautechnische/r Konstrukteur/in - Architektur */ 142962,
	/* Bautechnische/r Konstrukteur/in - Ingenieurbau */ 142964,
	/* Bautechnische/r Konstrukteur/in - Tief-, Verkehrswege- und Landschaftsbau */ 142963,
	/* Bauzeichner/in */ 13741,

	// --- Karim-specific niche bait (looks like Lager but unfindable) ---
	/* Fachkraft - Hafenlogistik */ 34996,
	/* Bergbautechnologe/-technologin - Tiefbautechnik */ 76437,
	/* Bergbautechnologe/-technologin - Tiefbohrtechnik */ 76429,
	/* Spezialtiefbauer/in */ 4188,
	/* Berg- und Maschinenmann/-frau - Transport und Instandhaltung */ 756,
	/* Berg- und Maschinenmann/-frau - Vortrieb und Gewinnung */ 757,
	/* Asphaltbauer/in */ 4303,
	/* Bauwerksmechaniker/in für Abbruch und Betontrenntechnik */ 27304,
];

// Tier C combines persona-specific banned occupations with the universal niche bait.
const tierC: number[] = [...personaSpecificTierC, ...UNIVERSAL_NICHE_BAIT];

// Top-result set: Verkäufer/in, Fachkraft Lagerlogistik, Fachlagerist, and their
// §66 Fachpraktiker variants — exactly as specified in the pass/fail check.
const topResultExpectedSet: number[] = [
	/* Verkäufer/in */ 6628,
	/* Fachkraft - Lagerlogistik */ 27448,
	/* Fachlagerist/in */ 27539,
	/* Fachpraktiker/in für Lagerlogistik (§66 BBiG/§42r HwO) */ 4708,
	/* Fachpraktiker/in im Verkauf (§66 BBiG/§42r HwO) */ 6649,
];

export const karimRubric: PersonaRubric = {
	tierS,
	tierA,
	tierC,
	criteria: [
		minTierSInTop8(4, tierS),
		noTierCInTop8(tierC),
		firstResultFromSet(
			topResultExpectedSet,
			"Top result is Verkäufer / Fachkraft Lagerlogistik / Fachlagerist or Fachpraktiker variant",
		),
		atLeastOneOfPopularityTier(
			"F_fachpraktiker",
			"Top 8 includes a Fachpraktiker entry (acknowledges foreign-degree barrier)",
		),
	],
};
