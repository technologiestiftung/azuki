import type { PersonaRubric } from "./types";
import {
	minTierSInTop8,
	noTierCInTop8,
	firstResultFromSet,
	atLeastOneInTop5,
} from "./criteria";
import { UNIVERSAL_NICHE_BAIT } from "./universal-niche-bait";

// Persona: Nico B. Source rubric: tools/eval-rubrics/nico.md (v2).
// 18, Hauptschulabschluss, dropped Kfz-Mechatroniker after 4 months.
// Key signals: workshop-trauma, no heavy/noise, car-adjacent, hands-on.

const tierS: number[] = [
	/* Fachkraft - Lagerlogistik */ 27448,
	/* Fahrzeuglackierer/in */ 15540,
	/* Fachpraktiker/in für Fahrzeugpflege (§66 BBiG/§42r HwO) */ 14969,
	/* Industrieelektriker/in - Betriebstechnik */ 76430,
	/* Fachpraktiker/in für Kfz-Mechatroniker (§66 BBiG/§42r HwO) */ 2376,
];

const tierA: number[] = [
	/* Fachlagerist/in */ 27539,
	/* Berufskraftfahrer/in */ 13794,
	// Author note: rubric specifies "Zweiradmechatroniker/in - Fahrradtechnik"
	// (not the Motorradtechnik Fachrichtung, and not the §66 variant).
	/* Zweiradmechatroniker/in - Fahrradtechnik */ 124409,
	/* Mechatroniker/in - Kältetechnik */ 35283,
	/* Konstruktionsmechaniker/in */ 29049,
	// Author note: "Maschinen- und Anlagenführer/in (any Fachrichtung)" — including
	// all 5 Fachrichtungen found in berufe.json. The rubric says most have noise=true
	// so these are borderline; they remain Tier A per the markdown.
	/* Maschinen- und Anlagenführer/in - Druckweiter- und Papierverarbeitung */ 132652,
	/* Maschinen- und Anlagenführer/in - Lebensmitteltechnik */ 132657,
	/* Maschinen- und Anlagenführer/in - Metall-, Kunststofftechnik */ 132653,
	/* Maschinen- und Anlagenführer/in - Textiltechnik */ 132655,
	/* Maschinen- und Anlagenführer/in - Textilveredelung */ 132656,
	/* Land- und Baumaschinenmechatroniker/in */ 124412,
	/* Sport- und Fitnesskaufmann/-frau */ 14449,
	/* Automobilkaufmann/-frau */ 6622,
];

// Persona-specific Tier C entries (beyond universal niche bait).
const personaSpecificTierC: number[] = [
	// --- His exact dropout (any Fachrichtung) ---
	/* Kraftfahrzeugmechatroniker/in - Karosserietechnik */ 122564,
	/* Kraftfahrzeugmechatroniker/in - Motorradtechnik */ 27300,
	/* Kraftfahrzeugmechatroniker/in - Nutzfahrzeugtechnik */ 27298,
	/* Kraftfahrzeugmechatroniker/in - Personenkraftwagentechnik */ 14799,
	/* Kraftfahrzeugmechatroniker/in - System- und Hochvolttechnik */ 122563,
	// same domain, same heavy/noise
	/* Karosserie- und Fahrzeugbaumechaniker/in - Caravan- und Reisemobiltechnik */ 137639,
	/* Karosserie- und Fahrzeugbaumechaniker/in - Karosserie- und Fahrzeugbautechnik */ 124530,
	/* Karosserie- und Fahrzeugbaumechaniker/in - Karosserieinstandhaltungstechnik */ 15166,
	/* Mechaniker/in - Reifen- und Vulkanisationstechnik - Reifen- und Fahrwerktechnik */ 27442,
	/* Mechaniker/in - Reifen- und Vulkanisationstechnik - Vulkanisationstechnik */ 27444,

	// --- Strongly customer-facing (conflicts with people:a) ---
	/* Friseur/in */ 9910,
	/* Fachpraktiker/in für Friseur (§66 BBiG/§42r HwO) */ 134513,
	/* Kosmetiker/in (duale Ausbildung) */ 14624,
	/* Kosmetiker/in (schulische Ausbildung) */ 9929,
	/* Florist/in */ 680,
	/* Fachpraktiker/in in der Floristik (§66 BBiG/§42r HwO) */ 93274,
	/* Hotelfachmann/-frau */ 10009,
	// Author note: "Hotel-/Restaurantfach" — berufe.json has no "Restaurantfachmann/-frau"
	// but has "Fachmann/-frau - Restaurants und Veranstaltungsgastronomie" (136125)
	// and "Fachmann/-frau - Systemgastronomie" (9997). Including both as the closest matches.
	/* Fachmann/-frau - Restaurants und Veranstaltungsgastronomie */ 136125,
	/* Fachmann/-frau - Systemgastronomie */ 9997,
	/* Servicekraft - Schutz und Sicherheit */ 70148,
	// Author note: rubric says "Verkäufer/in" (not the Lebensmittelhandwerk variants)
	// and "Kaufmann/-frau im Einzelhandel (unless the car-adjacent Automobilkaufmann)".
	// Automobilkaufmann is in Tier A so we exclude only the generic retail roles here.
	/* Verkäufer/in */ 6628,
	/* Kaufmann/-frau - Einzelhandel */ 6580,

	// --- Heavy/noise/grueling (explicit noGos) ---
	/* Asphaltbauer/in */ 4303,
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
	/* Beton- und Stahlbetonbauer/in */ 3980,
	/* Dachdecker/in */ 129406,
	/* Anlagenmechaniker/in - Sanitär-, Heizungs- und Klimatechnik */ 15164,
	/* Industriekeramiker/in Anlagentechnik */ 34941,
	/* Industriekeramiker/in Dekorationstechnik */ 34948,
	/* Industriekeramiker/in Modelltechnik */ 34938,
	/* Industriekeramiker/in Verfahrenstechnik */ 34943,
	/* Industrie-Isolierer/in */ 4279,
	/* Berg- und Maschinenmann/-frau - Transport und Instandhaltung */ 756,
	/* Berg- und Maschinenmann/-frau - Vortrieb und Gewinnung */ 757,

	// --- Education mismatch (Realschule/Abitur expected in practice) ---
	/* Technische/r Assistent/in - Automatisierungstechnik */ 14302,
	/* Technische/r Assistent/in - Bautechnik */ 5620,
	/* Technische/r Assistent/in - medizinische Gerätetechnik */ 2874,
	/* Technische/r Assistent/in - Metallografie und Werkstoffkunde */ 6379,
	/* Technische/r Assistent/in - naturkundliche Museen und Forschungsinstitute */ 13625,
	/* Technische/r Assistent/in - regenerative Energietechnik und Energiemanagement */ 33197,
	/* Designer/in (Ausbildung) - angewandte Formgebung, Schmuck und Gerät */ 14557,
	/* Designer/in (Ausbildung) - Foto */ 14326,
	/* Designer/in (Ausbildung) - Grafik */ 14217,
	/* Designer/in (Ausbildung) - Kommunikationsdesign */ 13968,
	/* Designer/in (Ausbildung) - Medien */ 8459,
	/* Designer/in (Ausbildung) - Mode */ 14319,
	/* Gestaltungstechnische/r Assistent/in */ 6515,
	/* Lacklaborant/in */ 6415,

	// --- Persona-specific niche bait (popularity Tier D/E) ---
	/* Polsterer/Polsterin */ 4432,
	/* Stanz- und Umformmechaniker/in */ 122285,
	/* Fahrzeuginterieur-Mechaniker/in */ 134333,
	/* Sattler/in - Fahrzeugsattlerei */ 35029,
	/* Fahrradmonteur/in */ 27394,
];

// Tier C combines persona-specific banned occupations with the universal niche bait.
const tierC: number[] = [...personaSpecificTierC, ...UNIVERSAL_NICHE_BAIT];

export const nicoRubric: PersonaRubric = {
	tierS,
	tierA,
	tierC,
	criteria: [
		minTierSInTop8(3, tierS),
		noTierCInTop8(tierC),
		firstResultFromSet(
			[...tierS, ...tierA],
			"Top result is from Tier S or A",
		),
		atLeastOneInTop5(
			[
				/* Fahrzeuglackierer/in */ 15540,
				/* Fachpraktiker/in für Fahrzeugpflege */ 14969,
				/* Fachpraktiker/in für Kfz-Mechatroniker */ 2376,
				/* Fachkraft - Lagerlogistik */ 27448,
			],
			"Top 5 acknowledges car/lager direction",
		),
	],
};
