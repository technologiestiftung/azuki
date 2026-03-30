import { Mistral } from "@mistralai/mistralai";
import type { UserProfile, MatchResult } from "@azuki/shared";
import type { ScoredOccupation } from "../matching/index.js";
import {
  EDUCATION_LABELS,
  INTEREST_LABELS,
  SUBJECT_LABELS,
  STRENGTH_LABELS,
  WORK_PREF_LABELS,
  NO_GO_LABELS,
  WORK_VALUE_LABELS,
} from "./labels.js";
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MAX_DESCRIPTION_LENGTH = 400;
const MIN_RESULTS = 5;
const MAX_RESULTS = 8;
const DEFAULT_REASONING = "Dieser Beruf passt zu deinem Profil.";

function buildSystemPrompt(): string {
  return `AUFGABE
Du bekommst:
- ein Profil eines Jugendlichen
- eine vorgefilterte Liste der 30 passendsten Ausbildungsberufe
- zu jedem Beruf strukturierte Daten und kurze Beschreibungstexte

Dein Job ist nicht, neue Berufe zu suchen.
Dein Job ist, die 30 vorgefilterten Berufe neu zu bewerten, neu zu sortieren und die ${MIN_RESULTS} bis ${MAX_RESULTS} Berufe auszuwählen, die am besten zum Jugendlichen passen.

KONTEXT ZUM MATCHING
Die Liste mit 30 Berufen wurde bereits durch einen deterministischen Matching-Algorithmus berechnet.
Dabei wurden strukturierte Kriterien wie Schulabschluss, No-Gos, Arbeitsvorlieben, Lieblingsfächer, Interessen, Stärken und Rahmenbedingungen berücksichtigt.

Nutze dieses Pre-Filtering als starke Grundlage.
Nutze das LLM-Re-Ranking, um innerhalb dieser 30 Berufe feiner zu unterscheiden.

PRIORISIERUNG
Gewichte die Signale ungefähr so:
- freie Texte / eigene Worte des Jugendlichen: 70 %
- strukturierte Profilfelder: 30 %

Freie Texte sind besonders wichtig, zum Beispiel:
- eigene Beschreibungen
- geheimes Talent
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
- Wähle nur Berufe aus der gegebenen Top-30-Liste.
- Erfinde keine neuen Berufe.
- Empfiehl keine Berufe, die klar gegen wichtige No-Gos sprechen, wenn es in der Top-30 passendere Alternativen gibt.
- Nutze den Schulabschluss als Realitätscheck, aber nicht als einziges Entscheidungskriterium.
- Nutze nur Informationen aus dem Profil, den gelieferten Berufsdaten und allgemein plausible Merkmale eines Berufs.
- Erfinde keine Wünsche, Erfahrungen, Stärken oder Lebensumstände, die nicht im Profil stehen.
- Wenn mehrere Berufe ähnlich gut passen, bevorzuge den Beruf, der die eigenen Worte des Jugendlichen besser trifft.
- Wenn du für einen Beruf keine klare individuelle Begründung geben kannst, wähle lieber einen anderen Beruf aus der Top-30-Liste.

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
Antworte ausschließlich als JSON-Array, ohne Markdown, ohne zusätzliche Erklärung.

Format:
[
  { "id": 12345, "begruendung": "Dieser Beruf könnte gut zu dir passen, weil ..." },
  { "id": 67890, "begruendung": "Das passt gut zu dir, wenn du gern ..." }
]`;
}

function label(id: string, map: Record<string, string>): string {
  return map[id] ?? id;
}

/**
 * Serializes the user profile into labeled German-language lines
 * for the Mistral prompt. Only non-empty fields are included.
 */
function formatProfileSections(profile: UserProfile): string {
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
  if (profile.favoriteSubjects.length > 0) {
    parts.push(
      `Lieblingsfächer: ${profile.favoriteSubjects.map((s) => label(s, SUBJECT_LABELS)).join(", ")}`,
    );
  }
  if (profile.interests.length > 0) {
    parts.push(
      `Interessen/Hobbys: ${profile.interests.map((s) => label(s, INTEREST_LABELS)).join(", ")}`,
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

  const prefLabels = Object.entries(profile.workPreferences)
    .filter(([, value]) => value !== null)
    .map(([key, value]) => {
      const pair = WORK_PREF_LABELS[key];
      if (!pair) return null;
      return value === "a" ? pair.a : pair.b;
    })
    .filter(Boolean);
  if (prefLabels.length > 0) {
    parts.push(`Arbeitsvorlieben: ${prefLabels.join(", ")}`);
  }

  if (profile.workValues?.length > 0) {
    parts.push(
      `Rahmenbedingungen: ${profile.workValues.map((v) => label(v, WORK_VALUE_LABELS)).join(", ")}`,
    );
  }

  const noGoLabels = Object.entries(profile.noGos)
    .filter(([, value]) => value === "rejected")
    .map(([key]) => label(key, NO_GO_LABELS));
  if (noGoLabels.length > 0) {
    parts.push(`No-Gos: ${noGoLabels.join(", ")}`);
  }

  if (profile.secretTalent) {
    parts.push(`Geheimes Talent: ${profile.secretTalent}`);
  }
  if (profile.practicalExperience) {
    parts.push(`Praktische Erfahrungen: ${profile.practicalExperience}`);
  }

  return parts.join("\n");
}

function formatOccupationList(scored: ScoredOccupation[]): string {
  return scored
    .map((item, index) => {
      const occupation = item.occupation;
      const description =
        occupation.descriptionShort ||
        occupation.taskSummary ||
        occupation.name;
      const truncated =
        description.length > MAX_DESCRIPTION_LENGTH
          ? description.slice(0, MAX_DESCRIPTION_LENGTH) + "..."
          : description;
      return `${index + 1}. [ID: ${occupation.id}] ${occupation.name}\n   ${truncated}`;
    })
    .join("\n\n");
}

function buildUserPrompt(
  scored: ScoredOccupation[],
  profile: UserProfile,
): string {
  return `PROFIL DES JUGENDLICHEN:
${formatProfileSections(profile)}

AUSBILDUNGSBERUFE (wähle die ${MIN_RESULTS}-${MAX_RESULTS} besten aus):
${formatOccupationList(scored)}`;
}

function toOccupationResult(
  item: ScoredOccupation,
  reasoning: string,
): MatchResult["occupations"][number] {
  return {
    id: item.occupation.id,
    name: item.occupation.name,
    score: item.score,
    images: item.occupation.images.slice(0, 3),
    taskSummary: item.occupation.taskSummary || "",
    reasoning,
  };
}

export async function mistralRank(
  scored: ScoredOccupation[],
  profile: UserProfile,
): Promise<MatchResult> {
  if (!MISTRAL_API_KEY) {
    console.warn("MISTRAL_API_KEY not set — returning pre-filter results");
    return fallbackResult(scored);
  }

  const client = new Mistral({ apiKey: MISTRAL_API_KEY });
  const response = await client.chat.complete({
    model: "mistral-large-latest",
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(scored, profile) },
    ],
    temperature: 0.3,
    responseFormat: { type: "json_object" },
  });

  const content =
    typeof response.choices?.[0]?.message?.content === "string"
      ? response.choices[0].message.content
      : "";

  let rankings: { id: number; begruendung: string }[];
  try {
    const parsed = JSON.parse(content);
    rankings = Array.isArray(parsed)
      ? parsed
      : parsed.berufe || parsed.results || [];
  } catch {
    console.error("Failed to parse Mistral response:", content);
    return fallbackResult(scored);
  }

  const occupationMap = new Map(
    scored.map((item) => [item.occupation.id, item]),
  );

  const result: MatchResult = {
    occupations: rankings
      .filter((ranking) => occupationMap.has(ranking.id))
      .map((ranking) => {
        const item = occupationMap.get(ranking.id)!;
        return toOccupationResult(item, ranking.begruendung);
      }),
  };

  if (result.occupations.length < MIN_RESULTS) {
    const usedIds = new Set(
      result.occupations.map((occupation) => occupation.id),
    );
    for (const item of scored) {
      if (result.occupations.length >= MAX_RESULTS) break;
      if (usedIds.has(item.occupation.id)) continue;
      result.occupations.push(toOccupationResult(item, DEFAULT_REASONING));
    }
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
