import { Mistral } from "@mistralai/mistralai";
import type { UserProfile, MatchResult } from "@azuki/shared";
import type { ScoredOccupation } from "../matching/index.js";

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

function buildSystemPrompt(): string {
	return `Du bist ein freundlicher Berufsberater für Jugendliche in Deutschland. 
Du hilfst jungen Menschen, passende Ausbildungsberufe zu finden.

Deine Aufgabe:
- Du bekommst ein Profil eines Jugendlichen (Interessen, Stärken, Wünsche, Schulabschluss).
- Du bekommst eine Liste von Ausbildungsberufen mit Beschreibungen.
- Wähle die 5 bis 8 Berufe aus, die am besten zum Profil passen.
- Schreibe für jeden gewählten Beruf eine kurze, motivierende Begründung (1-2 Sätze) in einfacher, jugendlicher Sprache.
- Berücksichtige besonders die eigenen Worte des Jugendlichen — sie drücken aus, was die strukturierten Fragen nicht erfassen konnten.

Antworte AUSSCHLIESSLICH im folgenden JSON-Format, ohne Markdown-Codeblöcke:
[
  { "id": 12345, "begruendung": "Dieser Beruf passt zu dir, weil ..." },
  { "id": 67890, "begruendung": "Das könnte was für dich sein, weil ..." }
]`;
}

function buildUserPrompt(
	scored: ScoredOccupation[],
	profile: UserProfile,
): string {
	const parts: string[] = [];
	if (profile.educationLevel) {
		parts.push(`Schulabschluss: ${profile.educationLevel}`);
	}
	if (profile.favoriteSubjects.length > 0) {
		parts.push(`Lieblingsfächer: ${profile.favoriteSubjects.join(", ")}`);
	}
	if (profile.interests.length > 0) {
		parts.push(`Interessen/Hobbys: ${profile.interests.join(", ")}`);
	}

	const strengthEntries = Object.entries(profile.strengths)
		.filter(([, v]) => v >= 0.5)
		.map(([k, v]) => `${k} (${v >= 1 ? "stark" : "etwas"})`);
	if (strengthEntries.length > 0) {
		parts.push(`Stärken: ${strengthEntries.join(", ")}`);
	}

	const prefA = Object.entries(profile.workPreferences)
		.filter(([, v]) => v === "a")
		.map(([k]) => k);
	if (prefA.length > 0) {
		parts.push(`Arbeitsvorlieben (Option A): ${prefA.join(", ")}`);
	}

	const prefB = Object.entries(profile.workPreferences)
		.filter(([, v]) => v === "b")
		.map(([k]) => k);
	if (prefB.length > 0) {
		parts.push(`Arbeitsvorlieben (Option B): ${prefB.join(", ")}`);
	}

	const noGos = Object.entries(profile.noGos)
		.filter(([, v]) => v === "rejected")
		.map(([k]) => k);
	if (noGos.length > 0) {
		parts.push(`No-Gos: ${noGos.join(", ")}`);
	}

	if (profile.secretTalent) {
		parts.push(`Geheimes Talent: ${profile.secretTalent}`);
	}
	if (profile.practicalExperience) {
		parts.push(`Praktische Erfahrungen: ${profile.practicalExperience}`);
	}

	const profileText = parts.join("\n");

	const occupationTexts = scored.map((s, i) => {
		const o = s.occupation;
		const desc = o.descriptionShort || o.taskSummary || o.name;
		const truncated = desc.length > 400 ? desc.slice(0, 400) + "..." : desc;
		return `${i + 1}. [ID: ${o.id}] ${o.name}\n   ${truncated}`;
	});

	return `PROFIL DES JUGENDLICHEN:
${profileText}

AUSBILDUNGSBERUFE (wähle die 5-8 besten aus):
${occupationTexts.join("\n\n")}`;
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
		model: "mistral-medium-latest",
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

	const occupationMap = new Map(scored.map((s) => [s.occupation.id, s]));
	const result: MatchResult = {
		occupations: rankings
			.filter((r) => occupationMap.has(r.id))
			.map((r) => {
				const s = occupationMap.get(r.id)!;
				return {
					id: s.occupation.id,
					name: s.occupation.name,
					score: s.score,
					images: s.occupation.images.slice(0, 3),
					taskSummary: s.occupation.taskSummary || "",
					reasoning: r.begruendung,
				};
			}),
	};

	if (result.occupations.length < 5) {
		const usedIds = new Set(result.occupations.map((o) => o.id));
		for (const s of scored) {
			if (result.occupations.length >= 8) break;
			if (usedIds.has(s.occupation.id)) continue;
			result.occupations.push({
				id: s.occupation.id,
				name: s.occupation.name,
				score: s.score,
				images: s.occupation.images.slice(0, 3),
				taskSummary: s.occupation.taskSummary || "",
				reasoning: "Dieser Beruf passt zu deinem Profil.",
			});
		}
	}

	return result;
}

function fallbackResult(scored: ScoredOccupation[]): MatchResult {
	return {
		occupations: scored.slice(0, 8).map((s) => ({
			id: s.occupation.id,
			name: s.occupation.name,
			score: s.score,
			images: s.occupation.images.slice(0, 3),
			taskSummary: s.occupation.taskSummary || "",
			reasoning: "Dieser Beruf passt zu deinem Profil.",
		})),
	};
}
