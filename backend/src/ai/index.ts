import OpenAI from "openai";
import type { UserProfile, MatchResult, GenerationInfo } from "@azuki/shared";
import { AI_MODEL_IDS, DEFAULT_MODEL_ID } from "@azuki/shared";
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

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const DEFAULT_MODEL = DEFAULT_MODEL_ID;
const MAX_DESCRIPTION_LENGTH = 400;
const MIN_RESULTS = 5;
const MAX_RESULTS = 8;
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

export function buildSystemPrompt(): string {
	return `AUFGABE
Du bekommst:
- ein Profil eines Jugendlichen
- eine vorgefilterte Liste der 40 passendsten Ausbildungsberufe
- zu jedem Beruf strukturierte Daten und kurze Beschreibungstexte

Dein Job ist nicht, neue Berufe zu suchen.
Dein Job ist, die 40 vorgefilterten Berufe neu zu bewerten, neu zu sortieren und die ${MIN_RESULTS} bis ${MAX_RESULTS} Berufe auszuwählen, die am besten zum Jugendlichen passen.

KONTEXT ZUM MATCHING
Die Liste mit 40 Berufen wurde bereits durch einen deterministischen Matching-Algorithmus berechnet.
Dabei wurden strukturierte Kriterien wie Schulabschluss, No-Gos, Arbeitsvorlieben, Lieblingsfächer, Interessen, Stärken und Rahmenbedingungen berücksichtigt.

Nutze dieses Pre-Filtering als starke Grundlage.
Nutze das LLM-Re-Ranking, um innerhalb dieser 40 Berufe feiner zu unterscheiden.

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
- Wähle nur Berufe aus der gegebenen Top-40-Liste.
- Erfinde keine neuen Berufe.
- Empfiehl keine Berufe, die klar gegen wichtige No-Gos sprechen, wenn es in der Top-40 passendere Alternativen gibt.
- Nutze den Schulabschluss als Realitätscheck, aber nicht als einziges Entscheidungskriterium.
- Nutze nur Informationen aus dem Profil, den gelieferten Berufsdaten und allgemein plausible Merkmale eines Berufs.
- Erfinde keine Wünsche, Erfahrungen, Stärken oder Lebensumstände, die nicht im Profil stehen.
- Wenn mehrere Berufe ähnlich gut passen, bevorzuge den Beruf, der die eigenen Worte des Jugendlichen besser trifft.
- Wenn du für einen Beruf keine klare individuelle Begründung geben kannst, wähle lieber einen anderen Beruf aus der Top-40-Liste.

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
		parts.push(`Geheimes Talent (eigene Angaben): ${profile.secretTalent}`);
	}
	if (profile.practicalExperience) {
		parts.push(
			`Praktische Erfahrungen (eigene Angaben): ${profile.practicalExperience}`,
		);
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
			const truncatedDesc =
				description.length > MAX_DESCRIPTION_LENGTH
					? `${description.slice(0, MAX_DESCRIPTION_LENGTH)}...`
					: description;
			let entry = `${index + 1}. [ID: ${occupation.id}] ${occupation.name}\n   ${truncatedDesc}`;
			if (occupation.competenciesText) {
				const truncatedComp =
					occupation.competenciesText.length > MAX_DESCRIPTION_LENGTH
						? `${occupation.competenciesText.slice(0, MAX_DESCRIPTION_LENGTH)}...`
						: occupation.competenciesText;
				entry += `\n   Kompetenzen: ${truncatedComp}`;
			}
			return entry;
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

	const { model, systemPrompt } = options;
	const selectedModel =
		model && AI_MODEL_IDS.has(model) ? model : DEFAULT_MODEL;
	const prompt = systemPrompt ?? buildSystemPrompt();

	const response = await getClient().chat.completions.create({
		model: selectedModel,
		messages: [
			{ role: "system", content: prompt },
			{ role: "user", content: buildUserPrompt(scored, profile) },
		],
		temperature: 0.3,
		response_format: { type: "json_object" },
	});

	const content = response.choices?.[0]?.message?.content ?? "";

	let rankings: { id: number; begruendung: string }[];
	try {
		const parsed = JSON.parse(content);
		rankings = Array.isArray(parsed)
			? parsed
			: parsed.berufe || parsed.results || [];
	} catch {
		console.error("Failed to parse AI response:", content);
		return fallbackResult(scored);
	}

	const occupationMap = new Map(
		scored.map((item) => [item.occupation.id, item]),
	);

	const result: MatchResult = {
		occupations: rankings
			.filter((ranking) => occupationMap.has(ranking.id))
			.map((ranking) => {
				// Safe: filtered above by occupationMap.has(ranking.id)
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const item = occupationMap.get(ranking.id)!;
				return toOccupationResult(item, ranking.begruendung);
			}),
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
