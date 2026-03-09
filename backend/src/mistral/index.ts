import { Mistral } from "@mistralai/mistralai";
import type { UserProfile, MatchResult } from "@azuki/shared";
import type { ScoredOccupation } from "../matching/index.js";
import {
  EDUCATION_LABELS,
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
  return `Du bist ein freundlicher Berufsberater für Jugendliche in Deutschland. 
Du hilfst jungen Menschen, passende Ausbildungsberufe zu finden.

Deine Aufgabe:
- Du bekommst ein Profil eines Jugendlichen (Interessen, Stärken, Wünsche, Schulabschluss).
- Du bekommst eine Liste von Ausbildungsberufen mit Beschreibungen.
- Wähle die ${MIN_RESULTS} bis ${MAX_RESULTS} Berufe aus, die am besten zum Profil passen.
- Schreibe für jeden gewählten Beruf eine kurze, motivierende Begründung (1-2 Sätze) in einfacher, jugendlicher Sprache.
- Berücksichtige besonders die eigenen Worte des Jugendlichen — sie drücken aus, was die strukturierten Fragen nicht erfassen konnten.

PRIORISIERUNGSREGELN:
1) Nutze die eigenen Worte des Jugendlichen als Hauptsignal (ca. 70% Gewicht).
2) Nutze strukturierte Felder (Interessen, Stärken, Präferenzen, Abschluss) nur als Nebensignal (ca. 30% Gewicht).
3) Bei Widerspruch gilt immer: eigene Worte > strukturierte Felder.
4) Die Reihenfolge der Berufsliste ist zwar ein Pre-Ranking, aber soll durch die Worte des Jugendlichen neu sortiert werden.
5) Achte besonders auf Rahmenbedingungen (z.B. "Flexible Arbeitszeiten"), die das Pre-Ranking nicht vollständig erfassen konnte. Nutze dein eigenes Wissen über die Berufe, um diese Wünsche bei der Auswahl und Sortierung zu berücksichtigen.

Antworte AUSSCHLIESSLICH im folgenden JSON-Format, ohne Markdown-Codeblöcke:
[
  { "id": 12345, "begruendung": "Dieser Beruf passt zu dir, weil ..." },
  { "id": 67890, "begruendung": "Das könnte was für dich sein, weil ..." }
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
    parts.push(`Interessen/Hobbys: ${profile.interests.join(", ")}`);
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
