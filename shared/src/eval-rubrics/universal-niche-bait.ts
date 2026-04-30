// Universal niche bait — occupations that should never appear in any persona's
// top 8 unless the user's free text directly names the craft/instrument.
// Source: tools/eval-rubrics/nico.md "Universal niche bait" section.
// All Fachrichtungen are expanded explicitly from berufe.json.

export const UNIVERSAL_NICHE_BAIT: number[] = [
	// --- String / bowed instruments ---
	/* Geigenbauer/in */
	2673,
	/* Zupfinstrumentenmacher/in - Gitarrenbau */
	124509,
	/* Zupfinstrumentenmacher/in - Harfenbau */
	124510,
	/* Bogenmacher/in */
	2674,

	// --- Wind instruments ---
	/* Holzblasinstrumentenmacher/in */
	2687,
	/* Metallblasinstrumentenmacher/in */
	2665,
	/* Handzuginstrumentenmacher/in */
	2694,

	// --- Keyboard / reed instruments ---
	// Author note: "Orgel- und Harmoniumbauer/in" appears in the rubric but
	// berufe.json has "Orgelbauer/in - Orgelbau" and "Orgelbauer/in - Pfeifenbau"
	// (no Harmonium variant found). Including both Orgelbauer Fachrichtungen.
	/* Orgelbauer/in - Orgelbau */
	132536,
	/* Orgelbauer/in - Pfeifenbau */
	132537,

	// --- Craft / artisan trades ---
	/* Bürsten- und Pinselmacher/in */
	130315,
	/* Böttcher/in */
	4539,
	/* Drechsler/in (Elfenbeinschnitzer/in) - Drechseln */
	1528,
	/* Drechsler/in (Elfenbeinschnitzer/in) - Elfenbeinschnitzen */
	1539,
	/* Vergolder/in */
	4640,

	// --- Gemstone / crystal ---
	/* Edelsteinschleifer/in - Edelsteingravieren */
	131163,
	/* Edelsteinschleifer/in - Edelsteinschleifen */
	131165,
	/* Edelsteinschleifer/in - Industriediamantschleifen */
	131166,
	/* Edelsteinschleifer/in - Schmuckdiamantschleifen */
	131167,

	// --- Glass ---
	/* Glasbläser/in - Christbaumschmuck */
	1092,
	/* Glasbläser/in - Glasgestaltung */
	1091,
	/* Glasbläser/in - Kunstaugen */
	1095,
	/* Leuchtröhrenglasbläser/in (glass-blowing adjacent) */
	1088,

	// --- Jewellery / precious metals ---
	// Author note: rubric says "Goldschmied (24/yr per Fachrichtung)"; berufe.json
	// uses "Gold- und Silberschmied/in" with two Fachrichtungen. Including both.
	// Elina's rubric additionally lists "Silberschmied", "Edelmetallprüfer",
	// "Vorpolierer" — the latter two were not found in berufe.json (flagged in report).
	/* Gold- und Silberschmied/in - Goldschmieden */
	142202,
	/* Gold- und Silberschmied/in - Silberschmieden */
	142203,

	// --- Fur / pelts ---
	/* Kürschner/in */
	3611,
	/* Pelzveredler/in */
	3602,
];
