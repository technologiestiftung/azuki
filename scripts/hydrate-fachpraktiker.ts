/**
 * Hydrates Fachpraktiker (§66 BBiG / §42r HwO) occupation records by inheriting
 * tag fields from their regular-Ausbildung parent.
 *
 * The BERUFENET API returns §66 records as near-empty stubs: no conditions,
 * no interests, no strengthTags, no skillTags. They are designed for trainees
 * who can't complete the regular Ausbildung (foreign degree, learning support,
 * Hauptschule). Without hydration, the deterministic preFilter scores them at
 * ~1 across the board and they never reach a user's top 40 — which defeats
 * the entire point of §66 existing.
 *
 * Strategy:
 *   1. For each §66 record, derive a parent-name key by stripping the
 *      "Fachpraktiker/in für|im|… " prefix and the "(§66 BBiG/§42r HwO)"
 *      suffix.
 *   2. Score every non-§66 occupation by token overlap with the key,
 *      with strong bias toward shorter / more-canonical parent names
 *      (so "Kfz-Mechatroniker" matches the PKW Fachrichtung rather than
 *      a niche one).
 *   3. For the cases where the name alone doesn't resolve (e.g. "Schmuckwerker",
 *      "Industriefachhelfer"), use an explicit override map.
 *   4. Inherit: conditions, interests, interestKeywords, strengthTags,
 *      skillTags, workLocations, digitalizationSignal, and degreeStats
 *      (only if §66 record has no own degreeStats). Subjects and salary
 *      stay as-is on the §66 record.
 *
 * Run standalone: npx tsx scripts/hydrate-fachpraktiker.ts
 *   Reads backend/src/data/berufe.json, hydrates in place, writes back.
 *
 * Called from fetch-berufe.ts in the normal fetch pipeline.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Occupation } from "@azuki/shared";

const FACHPRAKTIKER_RE = /\(§66\s*BBiG|§42r\s*HwO/i;

// Parents picked manually where the algorithmic name match either fails
// or would prefer a worse parent (e.g. a Fachverkäufer specialization
// instead of the canonical Verkäufer/in). Keys are §66 occupation IDs.
const PARENT_OVERRIDES: Record<number, number> = {
	// "Fachpraktiker im Verkauf" — there are 4 Berufe matching "Verkäufer",
	// 3 are Fachverkäufer-Lebensmittelhandwerk specializations. We want
	// the canonical Verkäufer/in (6628).
	6649: 6628,
	// "Fachpraktiker im Nahrungsmittelverkauf" — closest dual-system parent
	// is Fachverkäufer Lebensmittelhandwerk Bäckerei (most common variant
	// by trainee count). The §66 covers all food retail; one parent has
	// to stand in for the whole family.
	14818: 50920,
	// "Fachpraktiker Küche (Beikoch)" — Koch/Köchin is the canonical parent.
	3747: 3726,
	// "Fachpraktiker im Gastgewerbe" — Restaurantfachmann doesn't exist in
	// dataset; Hotelfachmann/-frau (10009) is the closest service-side
	// dual-system parent. Kitchen side is covered by Beikoch above.
	10088: 10009,
	// "Fachpraktiker im Gebäudeservice" → Gebäudereiniger/in (10236).
	50987: 10236,
	// "Fachpraktiker im Gesundheitswesen" — broad parent. Medizinische
	// Fachangestellte (33212) is the canonical entry-level dual-system
	// role in this space.
	138060: 33212,
	// "Fachpraktiker in der Floristik" → Florist/in.
	93274: 680,
	// "Fachpraktiker für Tierpflege (Heim und Pension)" → Tierpfleger
	// Tierheim und Tierpension Fachrichtung.
	119768: 533,
	// "Fachpraktiker für Holzverarbeitung" → Tischler/in (4460) is the
	// canonical Holz dual-system role.
	4463: 4460,
	// "Fachpraktiker für Hochbaufacharbeiter" — pick Beton- und
	// Stahlbetonarbeiten (largest Fachrichtung).
	3946: 132714,
	// "Fachpraktiker für Tiefbaufacharbeiter" — pick Brunnen- und
	// Spezialtiefbauarbeiten (canonical Tiefbau variant in dataset).
	4110: 132661,
	// "Fachpraktiker im Ausbaufachwerk" → Ausbaufacharbeiter Trockenbau.
	4012: 132721,
	// "Fachpraktiker für IT Systemintegration" — Fachinformatiker
	// Anwendungsentwicklung (largest variant).
	137038: 7856,
	// "Fachpraktiker für IT Systemelektronik" → IT-System-Elektroniker.
	34976: 2927,
	// "Fachpraktiker - Näherei, Schneiderei" → Textil- und Modeschneider.
	3258: 126796,
	// "Fachpraktiker für Medientechnologie Druck" → Medientechnologe Druck.
	130180: 90572,
	// "Fachpraktiker für Medientechnologie Druckverarbeitung" → parent.
	1495: 90574,
	// "Fachpraktiker für Metallbau" → Metallbauer Konstruktionstechnik
	// (largest Fachrichtung).
	2261: 2277,
	// "Fachpraktiker für Metalltechnik" → Fachkraft Metalltechnik
	// Montagetechnik (most common entry variant).
	2997: 122292,
	// "Fachpraktiker für Orthopädietechnik" → Orthopädietechnik-Mechaniker.
	134912: 122351,
	// "Fachpraktiker für Land- und Baumaschinentechnik" → parent.
	94629: 124412,
	// "Fachpraktiker für Bürstenherstellung" → Bürsten- und Pinselmacher.
	136258: 130315,
	// "Industriefachhelfer" → Industriemechaniker (canonical industrial
	// dual-system parent).
	3003: 29055,
	// "Fachpraktiker für Kfz-Mechatroniker" — pick the PKW Fachrichtung
	// (most common), not Karosserie/Motorrad/Nutzfahrzeug/System.
	2376: 14799,
	// "Fachpraktiker für Karosseriebearbeiter" — Karosserie- und
	// Fahrzeugbaumechaniker, Karosserieinstandhaltung Fachrichtung.
	2180: 15166,
	// "Fachpraktiker für Fahrzeugpflege" — no Fahrzeugpfleger/-reiniger
	// in the dataset. Fahrzeuglackierer is the nearest car-detailing
	// adjacent role; it carries the right workshop/no-screen tags.
	14969: 15540,
	// "Fachpraktiker für Zweiradmechatroniker" — pick Fahrradtechnik
	// variant (more common than Motorradtechnik).
	2473: 124409,
	// "Fachpraktiker für Elektroniker" — pick Betriebstechnik
	// (largest Fachrichtung).
	2739: 15623,
	// "Fachpraktiker für Maler und Lackierer" — pick Ausbautechnik
	// (largest Fachrichtung).
	4585: 134955,
	// "Fachpraktiker für Land- und Baumaschinentechnik" — parent is
	// Land- und Baumaschinenmechatroniker (one of three Fachrichtungen).
	// Verified below.
	// "Fachpraktiker im Gartenbau" — Gärtner/in, pick Garten- und
	// Landschaftsbau (most common).
	579: 588,
	// "Fachpraktiker für Pferdewirt" — pick Pferdehaltung und Service.
	58313: 77695,
	// "Schweißwerker" — Schweißer/in (15545).
	2074: 15545,
	// "Schmuckwerker" — Gold- und Silberschmied/in - Goldschmieden.
	2574: 142202,
	// "Telefonist" — closest parent is Servicefachkraft Dialogmarketing.
	7391: 35309,
	// "Raumausstatterwerker" — Raumausstatter/in.
	4425: 4405,
	// "Fachwerker - Feinwerktechnik" — Feinwerkmechaniker/in.
	3009: 15145,
	// "Schäftemacher" — Maßschuhmacher - Schaftbau (closest).
	29471: 131157,
	// "Industriefachhelfer" — opaque title; covers a range of industrial
	// helper roles. Industriemechaniker is the canonical industrial
	// dual-system parent.
	// (algorithmic search below resolves this if name matches)
	// "Fachpraktiker für Buchbinderei" — algorithm fails because the
	// suffix "-ei" makes the key longer than the candidate name. Buchbinder/in
	// (90590) is the obvious parent.
	1302: 90590,
	// "Fachpraktiker für Service in sozialen Einrichtungen" — no occupation
	// name contains "Service in sozialen Einrichtungen". The role overlaps
	// most with Sozialassistent/in (9031) which is the entry-level
	// dual-system social-services role.
	129985: 9031,
	// "Fachpraktiker für Technisches Produktdesign" — algorithm prefers
	// the shorter "Assistent/in - Produktdesign" name; the right canonical
	// parent is Technische/r Produktdesigner/in - Produktgestaltung (90588).
	6496: 90588,
};

interface MatchResult {
	parent: Occupation | null;
	score: number;
	source: "override" | "algorithm" | "none";
}

const STOP_TOKENS = new Set([
	"und",
	"oder",
	"für",
	"im",
	"in",
	"der",
	"die",
	"das",
	"den",
	"dem",
	"mit",
	"ohne",
	"von",
	"zur",
]);

function normalizeName(name: string): string {
	return name
		.toLowerCase()
		.replace(/[()\/]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function tokenize(name: string): string[] {
	return normalizeName(name)
		.split(/[\s-]+/)
		.filter((t) => t.length >= 3 && !STOP_TOKENS.has(t));
}

function deriveParentKey(fpName: string): string {
	// Strip Fachpraktiker prefix forms and §66 suffix.
	return fpName
		.replace(/^Fachpraktiker\/in\s+(?:für|im|in der|in)?\s*/i, "")
		.replace(/^Fachwerker\/in\s*-?\s*/i, "")
		.replace(/werker\/in\b/i, "") // for "Schmuckwerker", "Schweißwerker", etc.
		.replace(/\s*\(§66\s*BBiG.*?\)$/i, "")
		.replace(/\s+/g, " ")
		.trim();
}

function findParent(
	fpOccupation: Occupation,
	allOccupations: Occupation[],
): MatchResult {
	// 1. Explicit override?
	const overrideId = PARENT_OVERRIDES[fpOccupation.id];
	if (overrideId !== undefined) {
		const parent = allOccupations.find((o) => o.id === overrideId);
		if (parent) {
			return { parent, score: Infinity, source: "override" };
		}
	}

	// 2. Token-overlap matching against non-§66 occupations.
	const key = deriveParentKey(fpOccupation.name);
	const keyTokens = tokenize(key);
	if (keyTokens.length === 0) {
		return { parent: null, score: 0, source: "none" };
	}

	let best: { occ: Occupation; score: number } | null = null;
	for (const cand of allOccupations) {
		if (cand.id === fpOccupation.id) continue;
		if (FACHPRAKTIKER_RE.test(cand.name)) continue;

		const candNorm = normalizeName(cand.name);
		let score = 0;
		let matchedTokens = 0;
		for (const tok of keyTokens) {
			if (candNorm.includes(tok)) {
				score += tok.length;
				matchedTokens++;
			}
		}
		if (matchedTokens === 0) continue;

		// Prefer shorter candidate names — canonical Ausbildungen tend to
		// have terse names ("Verkäufer/in") vs. specialized variants
		// ("Fachverkäufer/in - Lebensmittelhandwerk (Bäckerei)").
		score = score * (matchedTokens / keyTokens.length);
		score -= candNorm.length * 0.02;

		if (!best || score > best.score) {
			best = { occ: cand, score };
		}
	}

	// Require at least one matched token covering ≥3 chars to accept.
	if (!best || best.score < 3) {
		return { parent: null, score: best?.score ?? 0, source: "none" };
	}
	return { parent: best.occ, score: best.score, source: "algorithm" };
}

/**
 * Mutates the passed `occupations` array so each Fachpraktiker §66 record
 * inherits structured tag fields from its identified parent. Subjects, name,
 * id, salary, descriptions, and images remain untouched.
 *
 * Returns a report (one entry per §66 record) describing what happened.
 */
export interface HydrationReport {
	id: number;
	name: string;
	parentId: number | null;
	parentName: string | null;
	source: MatchResult["source"];
	score: number;
}

export function hydrateFachpraktiker(occupations: Occupation[]): {
	hydrated: number;
	unresolved: number;
	report: HydrationReport[];
} {
	const fps = occupations.filter((o) => FACHPRAKTIKER_RE.test(o.name));
	let hydrated = 0;
	let unresolved = 0;
	const report: HydrationReport[] = [];

	for (const fp of fps) {
		const match = findParent(fp, occupations);
		if (!match.parent) {
			unresolved++;
			report.push({
				id: fp.id,
				name: fp.name,
				parentId: null,
				parentName: null,
				source: "none",
				score: match.score,
			});
			continue;
		}

		const parent = match.parent;

		// Inherit only the empty/missing fields; never overwrite §66-specific data.
		if (fp.conditions && Object.values(fp.conditions).every((v) => v === false)) {
			fp.conditions = { ...parent.conditions };
		}
		if (fp.interests.length === 0) {
			fp.interests = [...parent.interests];
		}
		if (fp.interestKeywords.length === 0) {
			fp.interestKeywords = [...parent.interestKeywords];
		}
		if (fp.strengthTags.length === 0) {
			fp.strengthTags = [...parent.strengthTags];
		}
		if (fp.skillTags.length === 0) {
			fp.skillTags = [...parent.skillTags];
		}
		if (!fp.workLocations && parent.workLocations) {
			fp.workLocations = parent.workLocations;
		}
		if (!fp.digitalizationSignal && parent.digitalizationSignal) {
			fp.digitalizationSignal = parent.digitalizationSignal;
		}
		// degreeStats: §66 records are designed for low-edu profiles. The
		// scoring engine penalizes when secondary+noQualification is below
		// 10%. Inheriting the parent's stats would re-introduce that penalty
		// for these accessible-by-design Berufe. Leave null so the education
		// penalty short-circuits to 0.
		// (no-op)

		// Persist the parent id so scorePopularity can derive parent-aware
		// popularity at runtime (§66 inherits parent's tier + design-intent
		// bonus, instead of a flat boost that over-lifts §66 records whose
		// parent trade is niche).
		fp.parentId = parent.id;

		hydrated++;
		report.push({
			id: fp.id,
			name: fp.name,
			parentId: parent.id,
			parentName: parent.name,
			source: match.source,
			score: match.score,
		});
	}

	return { hydrated, unresolved, report };
}

// Standalone entry point: read berufe.json, hydrate, write back.
if (import.meta.url === `file://${process.argv[1]}`) {
	const dataPath = resolve(
		fileURLToPath(import.meta.url),
		"../../backend/src/data/berufe.json",
	);
	const occupations: Occupation[] = JSON.parse(readFileSync(dataPath, "utf-8"));
	const result = hydrateFachpraktiker(occupations);
	console.log(`Hydrated ${result.hydrated} §66 records, ${result.unresolved} unresolved.\n`);
	for (const r of result.report) {
		const tag = r.parentId === null ? "[UNRESOLVED]" : `→ ${r.parentId}`;
		const src = r.parentId === null ? "" : ` (${r.source})`;
		console.log(`  ${String(r.id).padEnd(7)} ${r.name.slice(0, 60).padEnd(60)} ${tag}${src}  ${r.parentName ?? ""}`);
	}
	writeFileSync(dataPath, JSON.stringify(occupations, null, 2));
	console.log(`\nWrote ${dataPath}`);
}
