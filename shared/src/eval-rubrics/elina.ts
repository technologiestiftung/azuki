import type { PersonaRubric } from "./types";
import {
	minTierSInTop8,
	noTierCInTop8,
	firstResultFromSet,
	atLeastOneInTop5,
	atLeastOneFromEachSubcategory,
} from "./criteria";
import { UNIVERSAL_NICHE_BAIT } from "./universal-niche-bait";

// Persona: Elina M. Source rubric: tools/eval-rubrics/elina.md (v1).
// 17, Realschule letztes Schuljahr, 2nd-gen Bulgarian. Loves drawing/writing,
// translates for parents, undecided between Ausbildung and Fachabitur.
// Key signals: creative + helping, no noise/dirt, communication strength.

const tierS: number[] = [
	/* Sozialassistent/in */ 9031,
	/* Erzieher/in */ 9162,
	// Author note: "Erzieher/in - Jugend- und Heimerziehung" (9106) is a separate
	// Fachrichtung in berufe.json. Including it as part of the Erzieher S-tier
	// since both are the same occupation family and the rubric treats Erzieher as one entry.
	/* Erzieher/in - Jugend- und Heimerziehung */ 9106,
	/* Sozialpädagogische/r Assistent/in / Kinderpfleger/in */ 9170,
	/* Medizinische/r Fachangestellte/r */ 33212,
	/* Mediengestalter/in Digital und Print - Designkonzeption */ 137684,
];

const tierA: number[] = [
	/* Pflegefachmann/-frau (Ausbildung) */ 132173,
	/* Ergotherapeut/in (Ausbildung) */ 8779,
	/* Heilerziehungspfleger/in */ 9127,
	/* Logopäde/Logopädin (Ausbildung) */ 8764,
	/* Designer/in (Ausbildung) - Grafik */ 14217,
	/* Hörakustiker/in */ 129408,
	/* Augenoptiker/in */ 2634,
	/* Pharmazeutisch-kaufmännische/r Angestellte/r */ 6717,
	/* Buchhändler/in */ 13749,
	/* Kaufmann/-frau - Büromanagement */ 123266,
	/* Steuerfachangestellte/r */ 7573,
	/* Tiermedizinische/r Fachangestellte/r */ 33214,
	// Author note: "Verwaltungsfachangestellte/r (any Fachrichtung)" — including
	// all 5 Fachrichtungen found in berufe.json.
	/* Verwaltungsfachangestellte/r - Bundesverwaltung */ 7934,
	/* Verwaltungsfachangestellte/r - HWK und IHK */ 7933,
	/* Verwaltungsfachangestellte/r - Kirchenverwaltung - evangelische Kirche */ 7929,
	/* Verwaltungsfachangestellte/r - Kommunalverwaltung */ 7944,
	/* Verwaltungsfachangestellte/r - Landesverwaltung */ 7925,
];

// Persona-specific Tier C entries (beyond universal niche bait).
const personaSpecificTierC: number[] = [
	// --- Profile-conflict: heavy/dirty/loud ---
	/* Maler/in und Lackierer/in - Ausbautechnik und Oberflächengestaltung */ 134955,
	/* Maler/in und Lackierer/in - Bauten- und Korrosionsschutz */ 15532,
	/* Maler/in und Lackierer/in - Energieeffizienz- und Gestaltungstechnik */ 134954,
	/* Maler/in und Lackierer/in - Gestaltung und Instandhaltung */ 15530,
	/* Maler/in und Lackierer/in - Kirchenmalerei und Denkmalpflege */ 15534,
	/* Dachdecker/in */ 129406,
	/* Anlagenmechaniker/in - Sanitär-, Heizungs- und Klimatechnik */ 15164,
	/* Tischler/in */ 4460,
	/* Industriemechaniker/in */ 29055,
	/* Konstruktionsmechaniker/in */ 29049,
	/* Maschinen- und Anlagenführer/in - Druckweiter- und Papierverarbeitung */ 132652,
	/* Maschinen- und Anlagenführer/in - Lebensmitteltechnik */ 132657,
	/* Maschinen- und Anlagenführer/in - Metall-, Kunststofftechnik */ 132653,
	/* Maschinen- und Anlagenführer/in - Textiltechnik */ 132655,
	/* Maschinen- und Anlagenführer/in - Textilveredelung */ 132656,
	/* Hochbaufacharbeiter/in - Abbruch- und Betontrenntechnikarbeiten */ 139139,
	/* Hochbaufacharbeiter/in - Beton- und Stahlbetonarbeiten */ 132714,
	/* Hochbaufacharbeiter/in - Feuerungs- und Schornsteinbauarbeiten */ 132716,
	/* Hochbaufacharbeiter/in - Maurerarbeiten */ 132715,
	/* Tiefbaufacharbeiter/in - Brunnen- und Spezialtiefbauarbeiten */ 132661,
	/* Tiefbaufacharbeiter/in - Gleisbauarbeiten */ 132660,
	/* Tiefbaufacharbeiter/in - Kanalbauarbeiten */ 132662,
	/* Tiefbaufacharbeiter/in - Kanalbauarbeiten für Infrastrukturtechnik */ 139143,
	/* Tiefbaufacharbeiter/in - Leitungsbauarbeiten für Infrastrukturtechnik */ 139147,
	/* Tiefbaufacharbeiter/in - Rohrleitungsbauarbeiten */ 132663,
	/* Tiefbaufacharbeiter/in - Straßenbauarbeiten */ 132659,
	/* Maurer/in */ 3938,
	/* Kraftfahrzeugmechatroniker/in - Karosserietechnik */ 122564,
	/* Kraftfahrzeugmechatroniker/in - Motorradtechnik */ 27300,
	/* Kraftfahrzeugmechatroniker/in - Nutzfahrzeugtechnik */ 27298,
	/* Kraftfahrzeugmechatroniker/in - Personenkraftwagentechnik */ 14799,
	/* Kraftfahrzeugmechatroniker/in - System- und Hochvolttechnik */ 122563,
	// "no profile signal pointing here, plus heavy"
	/* Fachkraft - Lagerlogistik */ 27448,
	/* Fachlagerist/in */ 27539,
	// "profile leans creative-thoughtful; haircutting is too narrow a read of 'art'"
	/* Friseur/in */ 9910,

	// --- Education mismatch in the wrong direction (Hauptschule-rough) ---
	/* Gerüstbauer/in */ 4066,
	/* Berg- und Maschinenmann/-frau - Transport und Instandhaltung */ 756,
	/* Berg- und Maschinenmann/-frau - Vortrieb und Gewinnung */ 757,
	// Author note: "Bauten- und Objektbeschichter" not found by that exact name;
	// closest match is "Oberflächenbeschichter/in" (34975), included as the
	// intended occupation. Flagged in status report.
	/* Oberflächenbeschichter/in (= "Bauten- und Objektbeschichter" in rubric) */ 34975,

	// --- Elina-specific niche bait (fashion / design / fringe creative) ---
	/* Maßschneider/in */ 27398,
	/* Textil- und Modeschneider/in */ 126796,
	/* Änderungsschneider/in */ 33209,
	/* Designer/in (Ausbildung) - Mode */ 14319,
	/* Designer/in (Ausbildung) - Foto */ 14326,
	/* Designer/in (Ausbildung) - Kommunikationsdesign */ 13968,
	/* Designer/in (Ausbildung) - Medien */ 8459,
	/* Gamedesigner/in (Ausbildung) */ 14869,
	/* Bühnenmaler/in und Bühnenplastiker/in - Malerei */ 8502,
	/* Bühnenmaler/in und Bühnenplastiker/in - Plastik */ 14080,
	/* Audiodesigner/in - Musik (Ausbildung) */ 59038,
	/* Bekleidungstechnische/r Assistent/in */ 5924,
];

// Tier C combines persona-specific banned occupations with the universal niche bait.
const tierC: number[] = [...personaSpecificTierC, ...UNIVERSAL_NICHE_BAIT];

// Subcategories for the "must include ≥1 helping AND ≥1 creative" criterion.
// Author note: "schulische helping role" = roles whose primary purpose is
// direct care/support of people (Sozialassistent, Erzieher, Sozialpädagogische
// Assistent, MFA). "creative/communication role" = roles that explicitly engage
// drawing, design, or specialist communication (Mediengestalter, Designer-Grafik,
// Logopäde, Hörakustiker) — Logopäde classified here because the rubric notes it
// picks up the translator/communication strength directly.
const helpingSubcategoryIds: number[] = [
	/* Sozialassistent/in */ 9031,
	/* Erzieher/in */ 9162,
	/* Erzieher/in - Jugend- und Heimerziehung */ 9106,
	/* Sozialpädagogische/r Assistent/in / Kinderpfleger/in */ 9170,
	/* Medizinische/r Fachangestellte/r */ 33212,
	/* Heilerziehungspfleger/in */ 9127,
	/* Pflegefachmann/-frau (Ausbildung) */ 132173,
];

const creativeSubcategoryIds: number[] = [
	/* Mediengestalter/in Digital und Print - Designkonzeption */ 137684,
	/* Designer/in (Ausbildung) - Grafik */ 14217,
	/* Hörakustiker/in */ 129408,
	/* Logopäde/Logopädin (Ausbildung) */ 8764,
];

// Fachabitur-path roles: require or strongly favour Fachhochschulreife.
const fachabiturPathIds: number[] = [
	/* Erzieher/in */ 9162,
	/* Erzieher/in - Jugend- und Heimerziehung */ 9106,
	/* Ergotherapeut/in (Ausbildung) */ 8779,
	/* Logopäde/Logopädin (Ausbildung) */ 8764,
	/* Heilerziehungspfleger/in */ 9127,
];

export const elinaRubric: PersonaRubric = {
	tierS,
	tierA,
	tierC,
	criteria: [
		minTierSInTop8(3, tierS),
		// Criterion 2: the ≥3 Tier S must also cover helping AND creative.
		// Kept as a separate criterion so feedback is granular.
		atLeastOneFromEachSubcategory(
			[
				{ name: "helping (schulisch)", ids: helpingSubcategoryIds },
				{ name: "creative/communication", ids: creativeSubcategoryIds },
			],
			"Top 8 covers helping and creative roles",
		),
		noTierCInTop8(tierC),
		firstResultFromSet(
			[...tierS, ...tierA],
			"Top result is from Tier S or A",
		),
		atLeastOneInTop5(
			fachabiturPathIds,
			"Acknowledges Fachabitur path (Erzieher / Ergotherapeut / Logopäde / Heilerziehungspfleger)",
		),
		atLeastOneInTop5(
			[
				/* Mediengestalter/in Digital und Print - Designkonzeption */ 137684,
				/* Designer/in (Ausbildung) - Grafik */ 14217,
				/* Hörakustiker/in */ 129408,
			],
			"Hits creative/Kunst signal (Mediengestalter / Designer-Grafik / Hörakustiker)",
		),
	],
};
