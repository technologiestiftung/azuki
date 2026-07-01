import OpenAI from "openai";
import {
	type AccessLevel,
	type Occupation,
	type PopularityTier,
	type UserProfile,
	type MatchResult,
	type GenerationInfo,
	formatOccupationDisplayName,
	formatPracticalExperiencesForApi,
	getPopularityRecord,
	resolveOccupationShortDescription,
	AI_MODEL_IDS,
	DEFAULT_MODEL_ID,
} from "@azuki/shared";
import { occupationMatchMeta } from "../occupationMeta";
import type { ScoredOccupation } from "../matching/index.js";
import { FINAL_MATCH_COUNT, PREFILTER_TOP_K } from "../matching/index.js";
import {
	EDUCATION_LABELS,
	INTEREST_LABELS,
	SUBJECT_LABELS,
	STRENGTH_LABELS,
	WORK_PREF_LABELS,
	NO_GO_LABELS,
	WORK_EXPECTATION_LABELS,
} from "./labels.js";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const DEFAULT_MODEL = DEFAULT_MODEL_ID;
const MAX_DESCRIPTION_LENGTH = 400;
const MIN_RESULTS = 5;
const MAX_RESULTS = FINAL_MATCH_COUNT;
const DEFAULT_REASONING = "Dieser Beruf passt zu deinem Profil.";

// Lazy client construction. Constructing OpenAI at module load throws when
// OPENROUTER_API_KEY is missing, which broke pure-function tests that just
// want to import formatProfileSections from this file, and made Vercel cold
// starts fragile. Defer until the first aiRank() call.
let _client: OpenAI | null = null;
function getClient(): OpenAI {
	if (_client) {
		return _client;
	}
	_client = new OpenAI({
		baseURL: "https://openrouter.ai/api/v1",
		apiKey: OPENROUTER_API_KEY,
	});
	return _client;
}

export interface Ranking {
	id: number;
	begruendung: string;
}

/**
 * Keeps only rankings whose id appears in `validIds`, and drops any
 * duplicates (keeping the first occurrence). The LLM occasionally emits
 * the same id twice — without dedup the duplicate Beruf is rendered
 * twice in the final result and double-counted in the eval.
 *
 * When `limit` is given, the result is capped to that many rankings
 * (after filtering and dedup). The LLM is instructed to return at most
 * MAX_RESULTS, but a non-compliant model could echo the whole candidate
 * list; the cap enforces the ceiling defensively at the trust boundary.
 */
export function filterAndDedupeRankings(
	rankings: Ranking[],
	validIds: ReadonlySet<number>,
	limit?: number,
): Ranking[] {
	const seen = new Set<number>();
	const out: Ranking[] = [];
	for (const r of rankings) {
		if (limit !== undefined && out.length >= limit) {
			break;
		}
		if (!validIds.has(r.id)) {
			continue;
		}
		if (seen.has(r.id)) {
			continue;
		}
		seen.add(r.id);
		out.push(r);
	}
	return out;
}

/**
 * Robust extraction of the ranking array from an LLM response. Handles:
 * - direct JSON array: `[{...}, ...]`
 * - JSON object with the array under any key (e.g. GPT under `response_format:
 *   json_object` might wrap as `{ "auswahl": [...] }` or `{ "ranking": [...] }`)
 * - prose-prefixed responses (Claude tends to write analysis before the array
 *   even when asked for JSON only)
 *
 * Returns null if no usable array of `{id, begruendung}`-shaped entries
 * can be recovered.
 */
/**
 * Schema-aware fallback extractor. Used when JSON.parse fails because
 * Opus 4.6 embeds stray ASCII `"` inside `begruendung` values — sometimes
 * followed by `,` (`Stärke, „…", hilft…`), sometimes by letters
 * (`ist." Das zeigt`), making JSON-character heuristics ambiguous.
 *
 * Strategy: stop relying on JSON.parse. Walk balanced `{...}` chunks at
 * depth 1 inside an outer `[...]` array. For each chunk, pull `id` with
 * a number regex and `begruendung` with a greedy regex anchored on the
 * chunk's closing `}` — that anchor is structural, so stray quotes inside
 * the value don't matter. Anything between the begruendung's first `"`
 * and the last `"` before `}` becomes the captured value (with surviving
 * stray quotes escaped on output so they're valid in JS strings).
 *
 * Returns null if no chunks yield an id; callers fall through to other
 * candidates.
 */
function extractRankingsSchemaAware(s: string): Ranking[] | null {
	// Find the outer auswahl-style array. We accept any top-level array
	// of objects since the LLM might or might not wrap in {auswahl: [...]}
	// and might or might not emit ```json fences. We just need the [.
	const arrayStart = s.indexOf("[");
	if (arrayStart < 0) {
		return null;
	}

	// Walk to the matching ]. We intentionally do NOT track string
	// state: stray ASCII `"` inside Opus's begruendung values flips a
	// naive inString counter to the wrong state and causes us to skip
	// over real `}` chars. Brace balance alone works for our flat
	// auswahl schema — begruendung values contain German text, not
	// literal `{` or `}`.
	const objects: string[] = [];
	let depth = 0;
	let chunkStart = -1;
	for (let i = arrayStart; i < s.length; i++) {
		const ch = s[i];
		if (ch === "{") {
			if (depth === 0) {
				chunkStart = i;
			}
			depth++;
		} else if (ch === "}") {
			depth--;
			if (depth === 0 && chunkStart >= 0) {
				objects.push(s.slice(chunkStart, i + 1));
				chunkStart = -1;
			}
		} else if (ch === "]" && depth === 0) {
			break;
		}
	}
	if (objects.length === 0) {
		return null;
	}

	const rankings: Ranking[] = [];
	for (const obj of objects) {
		const idMatch = obj.match(/"id"\s*:\s*(\d+)/);
		if (!idMatch) {
			continue;
		}
		const id = parseInt(idMatch[1], 10);
		// Greedy `.+` anchored on the chunk's last `"` before `}`.
		// `[\s\S]` instead of `.` to span any internal newlines.
		const begMatch = obj.match(/"begruendung"\s*:\s*"([\s\S]+)"\s*\}\s*$/);
		const begruendung = begMatch ? begMatch[1] : "";
		rankings.push({ id, begruendung });
	}
	return rankings.length > 0 ? rankings : null;
}

export function extractRankings(content: string): Ranking[] | null {
	if (!content) {
		return null;
	}

	// Strip ALL C0 control characters (0x00–0x1F) and 0x7F. JSON spec
	// (RFC 8259 §7) disallows every one of these unescaped inside string
	// values — including tab (0x09), LF (0x0A), and CR (0x0D). Opus 4.6
	// observably emits raw tabs and CRs inside `begruendung` values,
	// which makes JSON.parse fail with "Bad control character in string
	// literal". The chars are also valid JSON whitespace between tokens,
	// so removing them never breaks structure; commas/colons/brackets
	// still delimit. The trade-off: if a control char appeared *inside*
	// a string value intentionally, we lose it — acceptable for our
	// matching pipeline.
	// eslint-disable-next-line no-control-regex
	const sanitized = content.replace(/[\x00-\x1F\x7F]/g, "");

	const candidates: unknown[] = [];

	// 1. Try parsing the full sanitized content (fast path for clean JSON).
	try {
		candidates.push(JSON.parse(sanitized));
	} catch {
		// fall through to extraction
	}

	// 1b. Strip markdown code fences (Opus 4.6 ignores "ohne Markdown" and
	// emits ```json ... ```). Try parsing the unwrapped body.
	const fenceMatch = sanitized.match(/```(?:json)?\s*([\s\S]*?)```/);
	if (fenceMatch) {
		try {
			candidates.push(JSON.parse(fenceMatch[1]));
		} catch {
			// fall through
		}
	}

	// 2. Extract the first balanced top-level array `[...]` from the
	// sanitized content. Handles prose-prefixed responses like
	// "Analyse: ...\n[ {...}, ... ]".
	const arrayStart = sanitized.indexOf("[");
	if (arrayStart >= 0) {
		let depth = 0;
		let inString = false;
		let escape = false;
		for (let i = arrayStart; i < sanitized.length; i++) {
			const ch = sanitized[i];
			if (escape) {
				escape = false;
				continue;
			}
			if (ch === "\\") {
				escape = true;
				continue;
			}
			if (ch === '"') {
				inString = !inString;
				continue;
			}
			if (inString) {
				continue;
			}
			if (ch === "[") {
				depth++;
			} else if (ch === "]") {
				depth--;
				if (depth !== 0) {
					continue;
				}
				try {
					candidates.push(JSON.parse(sanitized.slice(arrayStart, i + 1)));
				} catch {
					// ignore
				}
				break;
			}
		}
	}

	for (const cand of candidates) {
		const rankings = findRankingArray(cand);
		if (rankings) {
			return rankings;
		}
	}

	// 3. Schema-aware fallback. JSON.parse failed on every candidate —
	// usually because Opus 4.6 embeds stray ASCII `"` inside begruendung
	// values. Walk balanced object chunks and extract id+begruendung via
	// structural anchors (the closing `}`), not character-level quote
	// matching. This is the last line of defense before falling back to
	// preFilter results.
	return extractRankingsSchemaAware(sanitized);
}

function isRankingShape(value: unknown): value is Ranking {
	return (
		typeof value === "object" &&
		value !== null &&
		typeof (value as { id?: unknown }).id === "number"
	);
}

function findRankingArray(value: unknown): Ranking[] | null {
	if (Array.isArray(value)) {
		if (value.length === 0) {
			return null;
		}
		if (value.every(isRankingShape)) {
			return value.map((v) => ({
				id: v.id,
				begruendung: typeof v.begruendung === "string" ? v.begruendung : "",
			}));
		}
		return null;
	}
	if (typeof value === "object" && value !== null) {
		// Walk values looking for a ranking-shaped array. We don't recurse
		// deeply — the LLM may wrap once in an object, not nest arbitrarily.
		for (const v of Object.values(value as Record<string, unknown>)) {
			const arr = findRankingArray(v);
			if (arr) {
				return arr;
			}
		}
	}
	return null;
}

// V4 — freitext-first re-ranking with explicit signal hierarchy, No-Go
// handling, diversity rules, and justification structure. Replaces the
// 70/30 freetext framing of V1–V3 with a ranked signal model that stays
// closer to the prefilter order when freetext is thin.
export function buildSystemPromptV4(topK: number = PREFILTER_TOP_K): string {
	return `AUFGABE

Du bekommst:
- ein Profil eines Jugendlichen
- eine vorgefilterte Liste von ${topK} Ausbildungsberufen, bereits grob nach Passung sortiert
- zu jedem Beruf strukturierte Daten und kurze Beschreibungstexte

Deine Aufgabe ist NICHT, neue Berufe zu suchen.
Deine Aufgabe ist, die ${topK} Berufe neu zu bewerten, neu zu sortieren und die ${MIN_RESULTS} bis ${MAX_RESULTS} Berufe auszuwählen, die am besten zum Jugendlichen passen.


DEINE ROLLE IM MATCHING

Die ${topK} Berufe wurden bereits von einem deterministischen Algorithmus berechnet. Dieser Algorithmus ist gut bei strukturierten Kriterien (Schulabschluss, No-Gos, Interessen, Stärken, Arbeitsvorlieben), aber schwach bei allem, was in Freitext steht.

Dein Mehrwert liegt genau hier: Du sollst die Freitext-Signale nutzen, die der Algorithmus nicht sauber erfassen konnte, um unter den ${topK} Berufen feiner zu unterscheiden.

Die vorgegebene Reihenfolge ist ein Hinweis, kein Befehl. Du darfst einen Beruf deutlich nach oben oder unten verschieben, wenn der Freitext es klar rechtfertigt. Bei schwachen oder fehlenden Freitext-Signalen bleibst du näher an der vorgegebenen Reihenfolge.


WIE DU SIGNALE GEWICHTEST

Es gibt keine feste Prozentzahl. Folge dieser Rangordnung:

1. Harte Ausschlusskriterien (No-Gos, Schulabschluss als Realitätscheck) — haben Vorrang vor allem anderen.
2. Konkrete Freitext-Aussagen — eigene Beschreibungen, praktische Erfahrungen, individuelle Wünsche und Rahmenbedingungen. Sie sind dein wichtigstes Material, WENN sie konkret sind (echte Tätigkeiten, Erfahrungen, klare Wünsche oder Abneigungen).
3. Strukturierte Felder — Lieblingsfächer, Interessen, Stärken, Arbeitsvorlieben. Sie sind dein Hauptmaterial, wenn Freitext kurz, vage oder leer ist.

Regeln bei Konflikten:
- Konkrete Freitext-Aussagen schlagen widersprechende strukturierte Felder.
- Ein vager oder allgemeiner Freitext schlägt KEINE klaren strukturierten Felder.
- Ein No-Go oder ein harter Widerspruch wird NIE von positivem Freitext überdeckt.


UMGANG MIT NO-GOS

- Ein Beruf, bei dem ein No-Go zentral zum Berufsalltag gehört, kommt normalerweise NICHT in die finale Auswahl.
- Ein Beruf mit mehreren No-Go-Konflikten kommt nicht in die finale Auswahl.
- Ein Beruf mit nur einem leichten, randständigen Konflikt kann bleiben — aber nur, wenn die Gesamtpassung sehr stark ist. Begründe in diesem Fall die Passung besonders sorgfältig.
- „Es gibt vielleicht bessere Alternativen" ist KEINE ausreichende Begründung, einen No-Go-Beruf auszuschließen. Entscheide anhand des Berufs selbst.
- Lärm / Schwere körperliche Arbeit vs. Kleinkind-Pädagogik: Wenn „Arbeit mit Lärm" oder „Schwere körperliche Arbeit" als No-Go gewählt sind, schließe pädagogische Berufe im Kleinkindbereich (z. B. Erzieher/in, Kinderpfleger/in, Sozialpädagogische/r Assistent/in) deshalb NICHT aus. Jugendliche meinen damit typischerweise Baustelle, Maschinen oder Werkstatt — nicht den üblichen Kinderalltag. Empfehle diese Berufe weiter, wenn das restliche Profil gut passt — es sei denn, der Freitext lehnt Lärm oder schweres Heben ausdrücklich auch im Umgang mit kleinen Kindern ab.


VIELFALT DER ERGEBNISSE

Die finalen ${MIN_RESULTS} bis ${MAX_RESULTS} Berufe sollen mehrere unterschiedliche Richtungen abdecken.
- Wähle nicht mehrere inhaltlich fast identische Berufe, wenn die Top-${topK}-Liste ähnlich gut passende, aber andersartige Berufe enthält.
- Ziel: mehrere echte Optionen zum Nachdenken, nicht fünf Varianten desselben Berufs.
- Vielfalt geht aber nie auf Kosten der Passung. Nimm keinen schlecht passenden Beruf nur der Abwechslung wegen.


UMGANG MIT DÜNNEN PROFILEN

Manche Profile enthalten wenig Freitext oder wenige Angaben.
- Wenig Freitext: Stütze dich stärker auf die strukturierten Felder.
- Insgesamt dünnes Profil: Bevorzuge Berufe mit breiter, plausibler Passung statt enger Spezialisierung.
- Erfinde NICHTS, um eine Lücke zu füllen. Eine ehrliche, etwas allgemeinere Begründung ist besser als eine erfundene konkrete.


HARTE REGELN

- Wähle nur Berufe aus der gegebenen Top-${topK}-Liste. Verwende nur deren IDs.
- Erfinde keine neuen Berufe.
- Erfinde keine Wünsche, Erfahrungen, Stärken oder Lebensumstände, die nicht im Profil stehen.
- Nutze nur Informationen aus dem Profil, den gelieferten Berufsdaten und allgemein plausible, allgemein bekannte Merkmale eines Berufs.
- Deute die Worte des Jugendlichen nicht um. Greife auf, was wirklich dasteht.
- Wenn du für einen Beruf keine ehrliche, konkrete Begründung formulieren kannst, wähle lieber einen anderen Beruf aus der Top-${topK}.


AUFBAU JEDER BEGRÜNDUNG

Jede Begründung folgt diesem Muster, in einfacher Sprache und in 2 bis 4 kurzen Sätzen:

1. Signal: Greife ein konkretes Signal aus dem Profil auf (am besten in den eigenen Worten des Jugendlichen).
2. Berufsaspekt: Nenne, was in diesem Beruf dazu passt.
3. Fit: Erkläre kurz, warum daraus eine gute Passung entsteht.

Beispiel:
„Du hast geschrieben, dass du gern Dinge reparierst. In diesem Beruf arbeitest du jeden Tag mit den Händen und bringst Geräte wieder zum Laufen. Darum könnte das gut zu dir passen."

Der Ton darf die Stärke der Passung widerspiegeln. Ein sehr starker Treffer darf klar überzeugt klingen. Ein eher mittlerer Treffer darf vorsichtiger formuliert sein („Das könnte einen Blick wert sein, weil …"). So bleibt die Reihenfolge auch im Text spürbar.


SPRACHE

- einfache Sprache, kurze Sätze
- jugendnah, aber nicht künstlich
- motivierend und respektvoll
- keine Fachsprache
- keine Übertreibungen, keine leeren Floskeln
- keine negative oder defizitorientierte Sprache


SORTIERUNG UND AUSGABE

- Sortiere die Berufe vom besten zum schwächsten Match. Der erste Eintrag ist der stärkste Treffer.
- Gib mindestens ${MIN_RESULTS} und höchstens ${MAX_RESULTS} Berufe aus.
- Jede ID darf nur einmal vorkommen. Jede ID muss aus der Top-${topK}-Liste stammen.
- Antworte ausschließlich als JSON-Objekt, ohne Markdown, ohne zusätzlichen Text.
- „id" ist immer die numerische BERUFENET-ID hinter „[ID: …]" in der Berufsliste, niemals eine Position oder Reihenfolge.

Format:
{
  "results": [
    { "id": 12345, "begruendung": "Dieser Beruf könnte gut zu dir passen, weil …" },
    { "id": 67890, "begruendung": "Das könnte einen Blick wert sein, weil …" }
  ]
}`;
}

// V5 — V4 plus the Hinweise section for withContext candidate lists.
export function buildSystemPromptV5(topK: number = PREFILTER_TOP_K): string {
	return `${buildSystemPromptV4(topK)}

HINWEIS-ZEILE PRO BERUF
Zu jedem Beruf findest du in der Liste eine Zeile „Hinweise: …". Sie fasst zwei strukturierte Signale aus der BERUFENET-Datenbank zusammen, die du als verbindliche Bewertungsbasis nutzen sollst — nicht selbst raten:

1. Marktpräsenz (Findbarkeit im Alltag):
   Marktpräsenz ist KEIN eigenständiges Auswahl-Kriterium. Sie sagt nur, wie leicht eine Ausbildungsstelle praktisch zu finden ist. Profil-Passung kommt zuerst — Marktpräsenz hilft erst danach, zwischen mehreren gleich gut passenden Berufen den findbaren zu bevorzugen. Wähle nie einen Beruf, weil er beliebt ist; nur wenn das Profil ihn unabhängig stützt.
   • „Sehr beliebte Ausbildung" / „Etablierte Ausbildung" → leicht findbar; gute Wahl wenn das Profil sie unabhängig schon stützt. Bei profil-armen oder ambivalenten Eingaben NICHT als Standard-Anker missbrauchen.
   • „Kleine Ausbildung" → bewusst auswählen, nur wenn freier Text oder Stärken einen klaren Anker liefern.
   • „Sehr kleine Nischenausbildung" / „Auslaufende Ausbildung" → praktisch kaum oder gar nicht findbar; NUR empfehlen, wenn der freie Text die Tätigkeit wörtlich nennt.
   • „§66-Variante des Berufs X" → ERSTKLASSIGE Empfehlung für Profile mit Hauptschulabschluss, abgebrochener Ausbildung, begrenzten Deutschkenntnissen oder ohne Abschluss — aber NUR, wenn auch der Beruf X (oder ein eng verwandter aus demselben Richtungs-Cluster) zum Profil passt. §66 IT-Systemelektronik ist nur für IT-Profile passend, §66 Lagerlogistik nur für Lager-/Transport-Profile usw. Keine Trostvariante — bewusst und positiv aufnehmen, aber nie als „passt-für-alle-Hauptschule"-Joker.

2. Zugang (praktische Schulabschluss-Realität):
   • „ohne formalen Schulabschluss" → grundsätzlich zugänglich für jedes Profil.
   • „Hauptschulabschluss" / „Realschulabschluss" → klar einordnen am Profil-Abschluss.
   • „Fachhochschulreife — alternativ Realschule + vorherige Berufsausbildung" → Wenn das Profil Realschule (oder weniger) angibt OHNE vorherige Berufsausbildung im freien Text, behandle den Beruf als FHR-effektiv und damit zu hoch geschwellt. Nicht empfehlen, es sei denn das Profil zeigt explizit eine abgeschlossene Vorausbildung oder Fachabitur-Pfad.

Diese Hinweise überschreiben dein Bauchgefühl zu Findbarkeit und Zugangsrealität. Wenn der Hinweis einer Empfehlung widerspricht, gewinnt der Hinweis.`;
}

// V2 — the prompt previously inlined in compare-prompts.ts and
// multi-sample-eval.ts. Centralized here so the eval scripts and the
// production code path stay in sync.
//
// Differences from v1: explicit harte Regeln including practical-FHR
// realism (rule 3), §66 visibility (rule 4), findability (rule 5),
// ambivalence handling (rule 6). German-language adaptation (rule 7
// equivalent).
export function buildSystemPromptV2(topK: number = PREFILTER_TOP_K): string {
	return `AUFGABE
Du bekommst:
- ein Profil eines Jugendlichen
- eine vorgefilterte Liste der ${topK} passendsten Ausbildungsberufe
- zu jedem Beruf strukturierte Daten und kurze Beschreibungstexte

Dein Job ist nicht, neue Berufe zu suchen.
Dein Job ist, die ${topK} vorgefilterten Berufe neu zu bewerten, neu zu sortieren und die ${MIN_RESULTS} bis ${MAX_RESULTS} Berufe auszuwählen, die am besten zum Jugendlichen passen.

KONTEXT ZUM MATCHING
Die Top-${topK} stammt aus einem deterministischen Pre-Filter (Schulabschluss, No-Gos, Arbeitsvorlieben, Lieblingsfächer, Interessen, Stärken, Rahmenbedingungen, praktische Erfahrungen). Nutze sie als starke Grundlage und unterscheide *innerhalb* dieser Liste — vor allem über die freien Texte und die Realität des deutschen Ausbildungsmarkts.

PRIORISIERUNG
- freie Texte / eigene Worte: 60 %
- strukturierte Felder (inkl. praktische Erfahrungen im Pre-Filter): 40 %
Bei Widerspruch gewinnen freie Aussagen. Ausnahme: harte Ausschlüsse (No-Gos, abgebrochene Ausbildung, ausdrückliche Ablehnung) gelten immer.

HARTE REGELN
1. Nur Berufe aus der Top-${topK} wählen. Keine neuen erfinden.
2. ABGEBROCHEN/ABGELEHNT = NO-GO. Wenn der/die Jugendliche eine Ausbildung oder Tätigkeit explizit abgebrochen oder abgelehnt hat („ich habe Kfz abgebrochen", „kein Bürojob"), gilt das als No-Go für genau diesen Beruf UND für eng verwandte (gleiche Werkstatt-/Umgebungsfamilie, gleicher Tätigkeitskern). Ausnahme: eine vereinfachte Variante (z. B. Fachpraktiker §66) ist erlaubt, wenn die Begründung den Abbruch ausdrücklich aufgreift.
3. REALITÄTSCHECK SCHULABSCHLUSS — nicht nur Mindestabschluss, sondern praktische Zugänglichkeit:
   • Hauptschulabschluss: Berufe mit Titel „Assistent/in" oder „Designer/in" sind in der Praxis fast immer Realschule-gegated — nur wählen, wenn ein freier Text dort explizit hinzeigt.
   • Realschule + offen für Fachabitur: Pflege/Erzieher/Therapieberufe sind anschlussfähig, ruhig im Set lassen.
   • Ausländischer Abschluss + erkennbar einfaches Deutsch (kurze Sätze, A2-Wortwahl im Profil): pflegerische/pädagogische Berufe (Pflege, Erzieher, Sozialassistent) verlangen praktisch B2 — nur wählen, wenn der freie Text klare Sprach-Selbsteinschätzung dagegen liefert.
4. FACHPRAKTIKER (§66 BBiG) SICHTBAR MACHEN. Wenn das Profil auf eingeschränkten Schulabschluss, abgebrochene Ausbildung oder begrenzte Deutschkenntnisse hindeutet UND die Top-${topK} Fachpraktiker-Varianten der Wunschrichtung enthält, muss mindestens eine in die Empfehlungen. Diese Berufe sind genau für solche Profile gemacht.
5. FINDBARKEIT ZÄHLT. Bevorzuge bekannte Ausbildungen mit deutlicher Marktpräsenz (Verkäufer/in, Fachkraft Lagerlogistik, Kaufmann/-frau Büromanagement, Pflegefachmann/-frau, Maler/in, Koch/Köchin, Mediengestalter/in …). Berufe, die im Alltag praktisch nie genannt werden (Bogenmacher, Pelzveredler, Edelsteinschleifer, exotische Designer-Fachrichtungen, Geigenbauer u. ä.), nur dann empfehlen, wenn der freie Text das Handwerk wörtlich nennt.
6. VIELFALT BEI AMBIVALENZ. Wenn der/die Jugendliche unentschieden zwischen Richtungen ist („ich weiß nicht ob X oder Y"), spiegele beide Richtungen in der Top-Liste — nicht ${MAX_RESULTS} Varianten einer Richtung.
7. KEINE BEGRÜNDUNG, KEIN PLATZ. Wenn du für einen Beruf keine konkrete Begründung aus dem Profil ableiten kannst, wähle einen anderen.

WORAUF DU BESONDERS ACHTEN SOLLST
- freie Texte und individuelle Formulierungen — greife eigene Worte in mindestens einer Begründung wieder auf, am besten als Zitat oder enge Paraphrase
- praktische Erfahrungen aus Alltag, Schule, Familie, Verein, Praktikum, Job
- versteckte Stärken, persönliche Wünsche, Rahmenbedingungen

SPRACHE FÜR DIE BEGRÜNDUNGEN
- einfache, kurze, motivierende Sätze; jugendnah aber nicht künstlich; keine Fachsprache, keine Floskeln, keine defizitorientierte Sprache
- Sprachniveau ANPASSEN: Bei ausländischem Abschluss oder erkennbar begrenzten Deutschkenntnissen — sehr kurze Sätze, Präsens, keine Konjunktive, keine Schachtelsätze, keine seltenen Wörter.

QUALITÄT DER BEGRÜNDUNGEN
Jede Begründung muss:
- konkret auf den/die Jugendliche/n bezogen sein
- mindestens ein echtes Signal aus dem Profil aufgreifen
- die eigenen Worte aufgreifen, möglichst als direktes Zitat
- kurz erklären, warum der Beruf passen könnte
- nicht generisch klingen

AUSGABE
Antworte ausschließlich als JSON-Objekt mit dem Schlüssel "auswahl", dessen Wert ein Array ist. Ohne Markdown, ohne Vorrede, ohne zusätzliche Erklärung.
"id" ist immer die numerische BERUFENET-ID hinter "[ID: ...]" in der Berufsliste, niemals eine Position oder Reihenfolge.

Format:
{
  "auswahl": [
    { "id": 12345, "begruendung": "..." },
    { "id": 67890, "begruendung": "..." }
  ]
}`;
}

// V3 — V2 plus a section that teaches the model how to read the
// "Hinweise" line that appears under each Beruf when the user prompt is
// built with `withContext: true`. Rules 3 / 4 / 5 stay in place but the
// new section makes them anchored to the structured signal rather than
// vibes-based heuristics. Use together with `buildUserPrompt(..., {
// withContext: true })`.
export function buildSystemPromptV3(topK: number = PREFILTER_TOP_K): string {
	return `${buildSystemPromptV2(topK)}

HINWEIS-ZEILE PRO BERUF
Zu jedem Beruf findest du in der Liste eine Zeile "Hinweise: ...". Sie fasst zwei strukturierte Signale aus der BERUFENET-Datenbank zusammen, die du als verbindliche Bewertungsbasis nutzen sollst — nicht selbst raten:

1. Marktpräsenz (Findbarkeit im Alltag):
   Marktpräsenz ist KEIN eigenständiges Auswahl-Kriterium. Sie sagt nur, wie leicht eine Ausbildungsstelle praktisch zu finden ist. Profil-Passung kommt zuerst — Marktpräsenz hilft erst danach, zwischen mehreren gleich gut passenden Berufen den findbaren zu bevorzugen. Wähle nie einen Beruf, weil er beliebt ist; nur wenn das Profil ihn unabhängig stützt.
   • "Sehr beliebte Ausbildung" / "Etablierte Ausbildung" → leicht findbar; gute Wahl wenn das Profil sie unabhängig schon stützt. Bei profil-armen oder ambivalenten Eingaben NICHT als Standard-Anker missbrauchen.
   • "Kleine Ausbildung" → bewusst auswählen, nur wenn freier Text oder Stärken einen klaren Anker liefern.
   • "Sehr kleine Nischenausbildung" / "Auslaufende Ausbildung" → praktisch kaum oder gar nicht findbar; NUR empfehlen, wenn der freie Text die Tätigkeit wörtlich nennt.
   • "§66-Variante des Berufs X" → ERSTKLASSIGE Empfehlung für Profile mit Hauptschulabschluss, abgebrochener Ausbildung, begrenzten Deutschkenntnissen oder ohne Abschluss — aber NUR, wenn auch der Beruf X (oder ein eng verwandter aus demselben Richtungs-Cluster) zum Profil passt. §66 IT-Systemelektronik ist nur für IT-Profile passend, §66 Lagerlogistik nur für Lager-/Transport-Profile usw. Keine Trostvariante — bewusst und positiv aufnehmen, aber nie als „passt-für-alle-Hauptschule"-Joker.

2. Zugang (praktische Schulabschluss-Realität):
   • "ohne formalen Schulabschluss" → grundsätzlich zugänglich für jedes Profil.
   • "Hauptschulabschluss" / "Realschulabschluss" → klar einordnen am Profil-Abschluss.
   • "Fachhochschulreife — alternativ Realschule + vorherige Berufsausbildung" → Wenn das Profil Realschule (oder weniger) angibt OHNE vorherige Berufsausbildung im freien Text, behandle den Beruf als FHR-effektiv und damit zu hoch geschwellt. Nicht empfehlen, es sei denn das Profil zeigt explizit eine abgeschlossene Vorausbildung oder Fachabitur-Pfad.

Diese Hinweise überschreiben dein Bauchgefühl zu Findbarkeit und Zugangsrealität. Wenn der Hinweis einer Empfehlung widerspricht, gewinnt der Hinweis.`;
}

// V1 — original prompt, kept for backward compatibility.
export function buildSystemPrompt(topK: number = PREFILTER_TOP_K): string {
	return `AUFGABE
Du bekommst:
- ein Profil eines Jugendlichen
- eine vorgefilterte Liste der ${topK} passendsten Ausbildungsberufe
- zu jedem Beruf strukturierte Daten und kurze Beschreibungstexte

Dein Job ist nicht, neue Berufe zu suchen.
Dein Job ist, die ${topK} vorgefilterten Berufe neu zu bewerten, neu zu sortieren und die ${MIN_RESULTS} bis ${MAX_RESULTS} Berufe auszuwählen, die am besten zum Jugendlichen passen.

KONTEXT ZUM MATCHING
Die Liste mit ${topK} Berufen wurde bereits durch einen deterministischen Matching-Algorithmus berechnet.
Dabei wurden strukturierte Kriterien wie Schulabschluss, No-Gos, Arbeitsvorlieben, Lieblingsfächer, Interessen, Stärken, Rahmenbedingungen und praktische Erfahrungen berücksichtigt.

Nutze dieses Pre-Filtering als starke Grundlage.
Nutze das LLM-Re-Ranking, um innerhalb dieser ${topK} Berufe feiner zu unterscheiden.

PRIORISIERUNG
Gewichte die Signale ungefähr so:
- freie Texte / eigene Worte des Jugendlichen: 60 %
- strukturierte Profilfelder (inkl. praktische Erfahrungen im Pre-Filter): 40 %

Freie Texte sind besonders wichtig, zum Beispiel:
- eigene Beschreibungen
- eigene Stärken
- praktische Erfahrungen
- individuelle Wünsche
- persönliche Rahmenbedingungen

Strukturierte Felder sind ergänzend wichtig, zum Beispiel:
- Schulabschluss
- Lieblingsfächer
- Interessen
- Stärken
- Arbeitsvorlieben
- No-Gos
- Rahmenbedingungen

Wenn freie Aussagen und strukturierte Angaben sich widersprechen, gelten freie Aussagen stärker.
Ausnahme: harte Ausschlusskriterien dürfen nicht ignoriert werden.

HARTE REGELN
- Wähle nur Berufe aus der gegebenen Top-${topK}-Liste.
- Erfinde keine neuen Berufe.
- Empfiehl keine Berufe, die klar gegen wichtige No-Gos sprechen, wenn es in der Liste passendere Alternativen gibt.
- Nutze den Schulabschluss als Realitätscheck, aber nicht als einziges Entscheidungskriterium.
- Nutze nur Informationen aus dem Profil, den gelieferten Berufsdaten und allgemein plausible Merkmale eines Berufs.
- Erfinde keine Wünsche, Erfahrungen, Stärken oder Lebensumstände, die nicht im Profil stehen.
- Wenn mehrere Berufe ähnlich gut passen, bevorzuge den Beruf, der die eigenen Worte des Jugendlichen besser trifft.
- Wenn du für einen Beruf keine klare individuelle Begründung geben kannst, wähle lieber einen anderen Beruf aus der Liste.

WORAUF DU BESONDERS ACHTEN SOLLST
Berücksichtige besonders Signale, die im Pre-Filter nur teilweise oder gar nicht erfasst werden, zum Beispiel:
- freie Texte
- individuelle Formulierungen
- praktische Erfahrungen aus Alltag, Schule, Familie, Verein, Praktikum oder Job
- versteckte Stärken
- persönliche Wünsche an Arbeit und Umfeld
- Rahmenbedingungen, die nicht sauber strukturiert abgebildet sind

Achte außerdem darauf, ob ein Beruf vor allem passt wegen:
- Interesse
- Stärke
- Erfahrung
- Arbeitsweise
- Rahmenbedingungen

SPRACHE FÜR DIE BEGRÜNDUNGEN
- einfache Sprache
- kurze Sätze
- motivierend und respektvoll
- jugendnah, aber nicht künstlich
- keine Fachsprache
- keine Übertreibungen
- keine leeren Floskeln
- keine negative oder defizitorientierte Sprache

QUALITÄT DER BEGRÜNDUNGEN
Jede Begründung muss:
- konkret auf den Jugendlichen bezogen sein
- mindestens ein echtes Signal aus dem Profil aufgreifen
- kurz erklären, warum der Beruf gut passen könnte
- möglichst die eigenen Worte des Jugendlichen aufgreifen
- nicht generisch klingen

AUSGABE
Antworte ausschließlich als JSON-Objekt mit dem Schlüssel "auswahl", dessen Wert ein Array ist. Ohne Markdown, ohne Vorrede, ohne zusätzliche Erklärung.
"id" ist immer die numerische BERUFENET-ID hinter "[ID: ...]" in der Berufsliste, niemals eine Position oder Reihenfolge.

Format:
{
  "auswahl": [
    { "id": 12345, "begruendung": "Dieser Beruf könnte gut zu dir passen, weil ..." },
    { "id": 67890, "begruendung": "Das passt gut zu dir, wenn du gern ..." }
  ]
}`;
}

function label(id: string, map: Record<string, string>): string {
	return map[id] ?? id;
}

/**
 * Serializes the user profile into labeled German-language lines
 * for the AI prompt. Only non-empty fields are included.
 */
export function formatProfileSections(profile: UserProfile): string {
	const parts: string[] = [];

	if (profile.inSchool !== null) {
		parts.push(
			profile.inSchool
				? "Ist aktuell noch in der Schule"
				: "Hat die Schule bereits abgeschlossen",
		);
	}

	if (profile.educationLevel) {
		parts.push(
			`Schulabschluss: ${label(profile.educationLevel, EDUCATION_LABELS)}`,
		);
	}
	// Custom subjects are mirrored into `profile.favoriteSubjects` by the store
	// (see addCustomSubject in frontend/src/store/useAppStore.ts). Filter them
	// out of the structured "Lieblingsfächer" line so they only appear once,
	// under the "eigene Angaben" line below.
	const customSubjectSet = new Set(profile.customSubjects);
	const predefinedSubjects = profile.favoriteSubjects.filter(
		(id) => !customSubjectSet.has(id),
	);
	if (predefinedSubjects.length > 0) {
		parts.push(
			`Lieblingsfächer: ${predefinedSubjects.map((s) => label(s, SUBJECT_LABELS)).join(", ")}`,
		);
	}
	if (profile.customSubjects.length > 0) {
		parts.push(
			`Weitere Schulfächer (eigene Angaben): ${profile.customSubjects.join(", ")}`,
		);
	}
	// Custom interests are mirrored into `profile.interests` by the store
	// (see addCustomInterest in frontend/src/store/useAppStore.ts). Filter them
	// out of the structured "Interessen/Hobbys" line so they only appear once,
	// under the "eigene Angaben" line below.
	const customInterestSet = new Set(profile.customInterests);
	const predefinedInterests = profile.interests.filter(
		(id) => !customInterestSet.has(id),
	);
	if (predefinedInterests.length > 0) {
		parts.push(
			`Interessen/Hobbys: ${predefinedInterests.map((s) => label(s, INTEREST_LABELS)).join(", ")}`,
		);
	}
	if (profile.customInterests.length > 0) {
		parts.push(
			`Weitere Interessen (eigene Angaben): ${profile.customInterests.join(", ")}`,
		);
	}

	const strengthEntries = Object.entries(profile.strengths)
		.filter(([, value]) => value >= 0.5)
		.map(
			([key, value]) =>
				`${label(key, STRENGTH_LABELS)} (${value >= 1 ? "stark" : "etwas"})`,
		);
	if (strengthEntries.length > 0) {
		parts.push(`Stärken: ${strengthEntries.join(", ")}`);
	}
	const customStrengthCatalog = new Set(profile.customStrengths);
	const activeCustomStrengths = profile.selectedCustomStrengths.filter(
		(strength) => customStrengthCatalog.has(strength),
	);
	if (activeCustomStrengths.length > 0) {
		parts.push(
			`Weitere Stärken (eigene Angaben): ${activeCustomStrengths.join(", ")}`,
		);
	}

	const weaknessEntries = Object.entries(profile.strengths)
		.filter(([, value]) => value > 0 && value < 0.5)
		.map(([key]) => label(key, STRENGTH_LABELS));
	if (weaknessEntries.length > 0) {
		parts.push(`Eher nicht so gut in: ${weaknessEntries.join(", ")}`);
	}

	const prefLabels = Object.entries(profile.workPreferences)
		.filter(([, value]) => value !== null)
		.map(([key, value]) => {
			const pair = WORK_PREF_LABELS[key];
			if (!pair) {
				return null;
			}
			return value === "a" ? pair.a : pair.b;
		})
		.filter(Boolean);
	if (prefLabels.length > 0) {
		parts.push(`Arbeitsvorlieben: ${prefLabels.join(", ")}`);
	}

	const customWorkExpectationSet = new Set(profile.customWorkExpectations);
	const predefinedWorkExpectations = (profile.workExpectations ?? []).filter(
		(id) => !customWorkExpectationSet.has(id),
	);
	if (predefinedWorkExpectations.length > 0) {
		parts.push(
			`Rahmenbedingungen: ${predefinedWorkExpectations.map((v) => label(v, WORK_EXPECTATION_LABELS)).join(", ")}`,
		);
	}
	const workExpectationSelection = new Set(profile.workExpectations ?? []);
	const activeCustomWorkExpectations = profile.customWorkExpectations.filter(
		(expectation) => workExpectationSelection.has(expectation),
	);
	if (activeCustomWorkExpectations.length > 0) {
		parts.push(
			`Weitere Rahmenbedingungen (eigene Angaben): ${activeCustomWorkExpectations.join(", ")}`,
		);
	}

	const customNoGoSet = new Set(profile.customNoGos);
	const predefinedNoGoLabels = Object.entries(profile.noGos)
		.filter(([key, value]) => value === "rejected" && !customNoGoSet.has(key))
		.map(([key]) => label(key, NO_GO_LABELS));
	if (predefinedNoGoLabels.length > 0) {
		parts.push(`No-Gos: ${predefinedNoGoLabels.join(", ")}`);
	}
	const customNoGoLabels = profile.customNoGos.filter(
		(text) => profile.noGos[text] === "rejected",
	);
	if (customNoGoLabels.length > 0) {
		parts.push(
			`Weitere No-Gos (eigene Angaben): ${customNoGoLabels.join(", ")}`,
		);
	}

	const practicalExperienceText = formatPracticalExperiencesForApi(
		profile.practicalExperiences,
		profile.selectedPracticalExperienceIds,
	);
	if (practicalExperienceText) {
		parts.push(
			`Praktische Erfahrungen (eigene Angaben): ${practicalExperienceText}`,
		);
	}

	return parts.join("\n");
}

// Approximate count of yearly Ausbildung starts ("Plätze/Jahr"). Used in
// the per-Beruf context line so the LLM can weigh findability. Dual Berufe
// use the DAZUBI new-contract count (a31-12 source); schulische Berufe use
// the destatis student count where DAZUBI is null. Returns null if neither
// is available (mostly §66 records and a few G_unknown).
function approximateYearlyStarts(occupationId: number): number | null {
	const rec = getPopularityRecord(occupationId);
	if (!rec) {
		return null;
	}
	if (typeof rec.dazubiContracts === "number" && rec.dazubiContracts > 0) {
		return rec.dazubiContracts;
	}
	if (
		typeof rec.schulischeStudents === "number" &&
		rec.schulischeStudents > 0
	) {
		return rec.schulischeStudents;
	}
	return null;
}

// Rounds to ~2 significant figures and renders in German thousands format
// (period as Tausenderpunkt). 19710 → "~20.000", 5800 → "~5.800", 880 → "~880".
function roundStarts(n: number): string {
	let rounded: number;
	if (n >= 10000) {
		rounded = Math.round(n / 1000) * 1000;
	} else if (n >= 1000) {
		rounded = Math.round(n / 100) * 100;
	} else if (n >= 100) {
		rounded = Math.round(n / 10) * 10;
	} else {
		rounded = n;
	}
	return `~${rounded.toLocaleString("de-DE")}`;
}

// Translates the popularity tier into a one-line German signal that the
// LLM can use as a findability heuristic. Numbers are derived from the
// DAZUBI / destatis-Schüler counts in popularity-index.json. The §66
// tier replaces the popularity phrasing with a design-intent message —
// when the parent Ausbildung is resolvable, the message names it so the
// LLM treats §66 IT as IT-direction only, §66 Lager as Lager-direction
// only, etc. (Earlier generic phrasing led the model to pick §66 IT for
// a non-IT Hauptschule profile, since the message read as a universal
// "good for Hauptschule" rather than a direction-specific one.)
function popularityPhrase(
	tier: PopularityTier,
	starts: number | null,
	parentName: string | null,
): string {
	const startsSuffix =
		starts !== null ? ` (${roundStarts(starts)} Plätze/Jahr)` : "";
	switch (tier) {
		case "A_anchor":
			return `Sehr beliebte Ausbildung${startsSuffix}, im Alltag gut findbar`;
		case "B_solid":
			return `Etablierte Ausbildung${startsSuffix}, gut findbar`;
		case "C_smallReal":
			return `Kleine Ausbildung${startsSuffix}, schwerer findbar`;
		case "D_niche":
			return `Sehr kleine Nischenausbildung${startsSuffix}, im Alltag kaum findbar`;
		case "E_vanishing":
			return `Auslaufende Ausbildung${startsSuffix}, praktisch kaum noch findbar`;
		case "F_fachpraktiker":
			if (parentName) {
				return `§66-Variante des Berufs „${parentName}" — vereinfachte Form für Lernende mit Hauptschulabschluss oder ohne Schulabschluss`;
			}
			return `Pfad nach §66 BBiG / §42r HwO — vereinfachte Form für Lernende mit Hauptschulabschluss oder ohne Schulabschluss`;
		case "F_doppelqual":
			return `Doppelqualifizierungs-Pfad (Ausbildung + zusätzlicher Abschluss)`;
		case "G_unknown":
			return `Wenig Daten zur Marktgröße verfügbar`;
		default:
			throw new Error(`Unhandled popularity tier: ${tier as string}`);
	}
}

// Translates the parsed BERUFENET access requirement (field a30-0) into a
// concrete, audience-readable phrasing. Distinguishes "Realschule + prior
// Berufsausbildung" (which is the practical-FHR case — Erzieher, HEP, etc.)
// from "Fachhochschulreife genuinely required" by adding a "i.d.R. ... mit
// vorheriger beruflicher Vorbildung" hedge for the upgraded class.
function accessLevelPhrase(
	level: AccessLevel | null | undefined,
): string | null {
	switch (level) {
		case "unrestricted":
			return "Zugang ohne formalen Schulabschluss möglich";
		case "hauptschule":
			return "Zugang i.d.R. mit Hauptschulabschluss";
		case "realschule":
			return "Zugang i.d.R. mit Realschulabschluss";
		case "fachhochschulreife":
			return "Zugang i.d.R. Fachhochschulreife — alternativ Realschule + vorherige Berufsausbildung";
		case null:
		case undefined:
		default:
			return null;
	}
}

export function formatOccupationContext(occupation: Occupation): string | null {
	const rec = getPopularityRecord(occupation.id);
	const tier = rec?.popularityTier;
	const starts = approximateYearlyStarts(occupation.id);
	const access = accessLevelPhrase(occupation.accessLevel ?? null);
	// For §66 records the parent name names the *direction* (IT, Lager,
	// Friseur, ...). hydrate-fachpraktiker sets `parentId`; we resolve the
	// name from POPULARITY_INDEX which carries names for every Beruf the
	// scoring layer knows about. Falls back to the generic phrasing if
	// unresolved (rare).
	const parentName =
		tier === "F_fachpraktiker" && typeof occupation.parentId === "number"
			? (getPopularityRecord(occupation.parentId)?.name ?? null)
			: null;
	const popularity = tier ? popularityPhrase(tier, starts, parentName) : null;

	const parts = [popularity, access].filter((s): s is string => s !== null);
	if (parts.length === 0) {
		return null;
	}
	return parts.join(" | ");
}

export interface OccupationListOptions {
	withContext?: boolean;
}

export function formatOccupationList(
	scored: ScoredOccupation[],
	options: OccupationListOptions = {},
): string {
	return scored
		.map((item) => {
			const occupation = item.occupation;
			const description =
				occupation.taskSummary ||
				occupation.descriptionShort ||
				occupation.name;
			const truncatedDesc =
				description.length > MAX_DESCRIPTION_LENGTH
					? `${description.slice(0, MAX_DESCRIPTION_LENGTH)}...`
					: description;
			let entry = `[ID: ${occupation.id}] ${occupation.name}\n   ${truncatedDesc}`;
			if (occupation.competenciesText) {
				const truncatedComp =
					occupation.competenciesText.length > MAX_DESCRIPTION_LENGTH
						? `${occupation.competenciesText.slice(0, MAX_DESCRIPTION_LENGTH)}...`
						: occupation.competenciesText;
				entry += `\n   Kompetenzen: ${truncatedComp}`;
			}
			if (options.withContext) {
				const context = formatOccupationContext(occupation);
				if (context) {
					entry += `\n   Hinweise: ${context}`;
				}
			}
			return entry;
		})
		.join("\n\n");
}

export function buildUserPrompt(
	scored: ScoredOccupation[],
	profile: UserProfile,
	options: OccupationListOptions = {},
): string {
	return `PROFIL DES JUGENDLICHEN:
${formatProfileSections(profile)}

AUSBILDUNGSBERUFE (wähle die ${MIN_RESULTS}-${MAX_RESULTS} besten aus):
${formatOccupationList(scored, options)}`;
}

function toOccupationResult(
	item: ScoredOccupation,
	reasoning: string,
): MatchResult["occupations"][number] {
	const meta = occupationMatchMeta(item.occupation);
	return {
		id: item.occupation.id,
		name: formatOccupationDisplayName(item.occupation.name),
		rawName: item.occupation.name,
		score: item.score,
		images: item.occupation.images.slice(0, 3),
		shortDescription: resolveOccupationShortDescription(item.occupation),
		reasoning,
		...meta,
	};
}

async function fetchGenerationCost(
	generationId: string,
): Promise<GenerationInfo | undefined> {
	try {
		const res = await fetch(
			`https://openrouter.ai/api/v1/generation?id=${generationId}`,
			{
				headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}` },
			},
		);
		if (!res.ok) {
			return undefined;
		}
		const data = await res.json();
		return {
			model: data.model ?? "",
			cost: data.total_cost ?? 0,
			tokensInput: data.tokens_prompt ?? 0,
			tokensOutput: data.tokens_completion ?? 0,
		};
	} catch {
		return undefined;
	}
}

export interface AiRankOptions {
	model?: string;
	systemPrompt?: string;
	withContext?: boolean;
}

export async function aiRank(
	scored: ScoredOccupation[],
	profile: UserProfile,
	options: AiRankOptions = {},
): Promise<MatchResult> {
	if (!OPENROUTER_API_KEY) {
		console.warn("OPENROUTER_API_KEY not set — returning pre-filter results");
		return fallbackResult(scored);
	}

	const { model, systemPrompt, withContext } = options;
	const selectedModel =
		model && AI_MODEL_IDS.has(model) ? model : DEFAULT_MODEL;
	// Production default: v5 system prompt + Hinweise-augmented candidate list.
	// Callers (eval scripts, admin endpoints) override both explicitly.
	const prompt = systemPrompt ?? buildSystemPromptV5();
	const useContext = withContext ?? true;

	const response = await getClient().chat.completions.create({
		model: selectedModel,
		messages: [
			{ role: "system", content: prompt },
			{
				role: "user",
				content: buildUserPrompt(scored, profile, {
					withContext: useContext,
				}),
			},
		],
		temperature: 0.3,
		response_format: { type: "json_object" },
	});

	const content = response.choices?.[0]?.message?.content ?? "";

	const rankings = extractRankings(content);
	if (rankings === null) {
		console.error("Failed to parse AI response:", content);
		// Dump raw bytes (gated by env flag) so we can inspect what the
		// model actually sent — terminal rendering hides control chars and
		// makes the failure mode hard to diagnose otherwise.
		if (process.env.AZUKI_DUMP_BAD_LLM_RESPONSES) {
			try {
				const fs = await import("node:fs");
				const path = await import("node:path");
				const stamp = new Date().toISOString().replace(/[:.]/g, "-");
				const file = path.resolve(
					process.cwd(),
					`bad-llm-response-${stamp}.bin`,
				);
				fs.writeFileSync(file, content);
				console.error(`  raw response written to ${file}`);
			} catch (err) {
				console.error("  could not dump raw response:", err);
			}
		}
		return fallbackResult(scored);
	}

	const occupationMap = new Map(
		scored.map((item) => [item.occupation.id, item]),
	);

	const validIds = new Set(occupationMap.keys());
	const result: MatchResult = {
		occupations: filterAndDedupeRankings(rankings, validIds, MAX_RESULTS).map(
			(ranking) => {
				// Safe: filterAndDedupeRankings keeps only ids that are in validIds.
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const item = occupationMap.get(ranking.id)!;
				return toOccupationResult(item, ranking.begruendung);
			},
		),
	};

	if (result.occupations.length < MIN_RESULTS) {
		const usedIds = new Set(
			result.occupations.map((occupation) => occupation.id),
		);
		for (const item of scored) {
			if (result.occupations.length >= MAX_RESULTS) {
				break;
			}
			if (usedIds.has(item.occupation.id)) {
				continue;
			}
			result.occupations.push(toOccupationResult(item, DEFAULT_REASONING));
		}
	}

	const generation = await fetchGenerationCost(response.id);
	if (generation) {
		result.generation = generation;
	}

	return result;
}

function fallbackResult(scored: ScoredOccupation[]): MatchResult {
	return {
		occupations: scored
			.slice(0, MAX_RESULTS)
			.map((item) => toOccupationResult(item, DEFAULT_REASONING)),
	};
}
