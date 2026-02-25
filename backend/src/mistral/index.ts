import { Mistral } from "@mistralai/mistralai";
import type { UserProfile, MatchResult } from "../types.js";
import type { ScoredBeruf } from "../matching/index.js";

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

function buildUserPrompt(scored: ScoredBeruf[], profile: UserProfile): string {
	const parts: string[] = [];
	if (profile.schulabschluss) {
		parts.push(`Schulabschluss: ${profile.schulabschluss}`);
	}
	if (profile.lieblingsfaecher.length > 0) {
		parts.push(`Lieblingsfächer: ${profile.lieblingsfaecher.join(", ")}`);
	}
	if (profile.interessen.length > 0) {
		parts.push(`Interessen/Hobbys: ${profile.interessen.join(", ")}`);
	}

	const staerkenEntries = Object.entries(profile.staerken)
		.filter(([, v]) => v >= 0.5)
		.map(([k, v]) => `${k} (${v >= 1 ? "stark" : "etwas"})`);
	if (staerkenEntries.length > 0) {
		parts.push(`Stärken: ${staerkenEntries.join(", ")}`);
	}

	const prefA = Object.entries(profile.arbeitsbedingungen)
		.filter(([, v]) => v === "a")
		.map(([k]) => k);
	if (prefA.length > 0) {
		parts.push(`Arbeitsvorlieben (Option A): ${prefA.join(", ")}`);
	}

	const prefB = Object.entries(profile.arbeitsbedingungen)
		.filter(([, v]) => v === "b")
		.map(([k]) => k);
	if (prefB.length > 0) {
		parts.push(`Arbeitsvorlieben (Option B): ${prefB.join(", ")}`);
	}

	const noGos = Object.entries(profile.noGos)
		.filter(([, v]) => v === "geht_nicht")
		.map(([k]) => k);
	if (noGos.length > 0) {
		parts.push(`No-Gos: ${noGos.join(", ")}`);
	}

	if (profile.geheimesTalent) {
		parts.push(`Geheimes Talent: ${profile.geheimesTalent}`);
	}
	if (profile.praktischeErfahrungen) {
		parts.push(`Praktische Erfahrungen: ${profile.praktischeErfahrungen}`);
	}

	const profileText = parts.join("\n");

	const berufTexts = scored.map((s, i) => {
		const b = s.beruf;
		const desc = b.steckbriefKurz || b.aufgabenKompakt || b.name;
		const truncated = desc.length > 400 ? desc.slice(0, 400) + "..." : desc;
		return `${i + 1}. [ID: ${b.id}] ${b.name}\n   ${truncated}`;
	});

	return `PROFIL DES JUGENDLICHEN:
${profileText}

AUSBILDUNGSBERUFE (wähle die 5-8 besten aus):
${berufTexts.join("\n\n")}`;
}

export async function mistralRank(
	scored: ScoredBeruf[],
	profile: UserProfile,
): Promise<MatchResult> {
	if (!MISTRAL_API_KEY) {
		console.warn("MISTRAL_API_KEY not set — returning grob-filter results");
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

	const berufMap = new Map(scored.map((s) => [s.beruf.id, s]));
	const result: MatchResult = {
		berufe: rankings
			.filter((r) => berufMap.has(r.id))
			.map((r) => {
				const s = berufMap.get(r.id)!;
				return {
					id: s.beruf.id,
					name: s.beruf.name,
					score: s.score,
					bilder: s.beruf.bilder.slice(0, 3),
					aufgabenKompakt: s.beruf.aufgabenKompakt || "",
					begruendung: r.begruendung,
				};
			}),
	};

	if (result.berufe.length < 5) {
		const usedIds = new Set(result.berufe.map((b) => b.id));
		for (const s of scored) {
			if (result.berufe.length >= 8) break;
			if (usedIds.has(s.beruf.id)) continue;
			result.berufe.push({
				id: s.beruf.id,
				name: s.beruf.name,
				score: s.score,
				bilder: s.beruf.bilder.slice(0, 3),
				aufgabenKompakt: s.beruf.aufgabenKompakt || "",
				begruendung: "Dieser Beruf passt zu deinem Profil.",
			});
		}
	}

	return result;
}

function fallbackResult(scored: ScoredBeruf[]): MatchResult {
	return {
		berufe: scored.slice(0, 8).map((s) => ({
			id: s.beruf.id,
			name: s.beruf.name,
			score: s.score,
			bilder: s.beruf.bilder.slice(0, 3),
			aufgabenKompakt: s.beruf.aufgabenKompakt || "",
			begruendung: "Dieser Beruf passt zu deinem Profil.",
		})),
	};
}
