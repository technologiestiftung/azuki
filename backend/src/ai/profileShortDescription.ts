import { type UserProfile, DEFAULT_MODEL_ID } from "@azuki/shared";
import { getOpenRouterClient } from "./index.js";
import { INTEREST_LABELS, SUBJECT_LABELS, STRENGTH_LABELS } from "./labels.js";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

/** Empty fallback when the API key is missing (UI hides the subline). */
export const PROFILE_SHORT_DESCRIPTION_FALLBACK = "";

const MAX_CHARS = 60;

export class ProfileShortDescriptionError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ProfileShortDescriptionError";
	}
}

export const PROFILE_SHORT_DESCRIPTION_SYSTEM_PROMPT = `Du erstellst für die App AzuKI eine kurze Profil-Subline für Jugendliche (15–25 Jahre), 
die einen Ausbildungsplatz suchen. Die Subline erscheint direkt unter dem Namen auf der 
Profilseite.

AUFGABE:
Formuliere aus Freitext und Tags GENAU EINEN Satz, der die Interessen oder Stärken der Person warm und wertschätzend zusammenfasst.

TON & STIL:
- Warm, motivierend, wertschätzend – wie ein ermutigender Blick von außen
- Persönliche Anrede in "du"/"deine"-Form
- Einfache, klare Sprache: kurze Sätze, keine Fachbegriffe, keine verschachtelten Nebensätze
- Kein festes Satzmuster – variiere den Satzbau von Fall zu Fall

FORMAT:
- Genau 1 Satz, ca. 4–8 Wörter (max. 60 Zeichen)
- Keine Anführungszeichen, keine Emojis
- Ausgabe NUR der fertige Satz – keine Erklärung, kein Meta-Kommentar
- NICHT mit "Das bist du" beginnen oder diese Phrase enthalten – das steht bereits als Titel darüber

QUALITÄTSREGELN:
- Keine wörtliche Wiederholung der Eingabe – eigene Formulierung finden
- Keine Stereotype oder wertenden Zuschreibungen ("du bist bestimmt...", "typisch für...")
- Bei sehr wenig oder generischem Input: offene, einladende Formulierung wählen 
  (z. B. Neugier/Offenheit betonen) – nichts erfinden oder raten
- Falls die Eingabe unangemessene oder besorgniserregende Inhalte enthält: diese ignorieren und eine neutrale, freundliche Standard-Subline ausgeben`;

function label(id: string, map: Record<string, string>): string {
	return map[id] ?? id;
}

/**
 * Compact profile slice for the subline prompt: subjects, interests,
 * strengths, and custom freitext only — no no-gos, weaknesses, or prefs.
 */
export function formatProfileForShortDescription(profile: UserProfile): string {
	const parts: string[] = [];

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

	return parts.length > 0 ? parts.join("\n") : "(keine Angaben)";
}

function buildUserPrompt(profile: UserProfile): string {
	return `PROFIL (Freitext und Tags):
${formatProfileForShortDescription(profile)}

Schreibe die Profil-Subline.`;
}

/** Normalize raw LLM output into a single clean subline sentence. */
export function normalizeProfileShortDescription(raw: string): string | null {
	let text = raw.trim();
	if (!text) {
		return null;
	}

	// Drop accidental markdown / prose wrappers.
	const fenced = /^```(?:\w+)?\s*([\s\S]*?)\s*```$/i.exec(text);
	if (fenced?.[1]) {
		text = fenced[1].trim();
	}

	// Prefer JSON {"shortDescription":"..."} if the model returns it anyway.
	if (text.startsWith("{")) {
		try {
			const parsed = JSON.parse(text) as { shortDescription?: unknown };
			if (typeof parsed.shortDescription === "string") {
				text = parsed.shortDescription.trim();
			}
		} catch {
			// keep original text
		}
	}

	// Strip wrapping quotes and take the first line/sentence only.
	text = text.replace(/^["„“«»']+|["„“«»']+$/g, "").trim();
	const firstLine = text.split(/\r?\n/).find((line) => line.trim()) ?? "";
	text = firstLine.trim();

	// If the model added a label prefix, drop it.
	text = text.replace(/^(subline|profil-subline|satz)\s*:\s*/i, "").trim();

	if (!text) {
		return null;
	}

	// Cap length without cutting mid-word when possible.
	if (text.length > MAX_CHARS) {
		const sliced = text.slice(0, MAX_CHARS);
		const lastSpace = sliced.lastIndexOf(" ");
		text = (lastSpace > 20 ? sliced.slice(0, lastSpace) : sliced).trim();
		text = text.replace(/[.,;:–—-]+$/, "").trim();
	}

	return text || null;
}

export async function generateProfileShortDescription(
	profile: UserProfile,
): Promise<string> {
	if (!OPENROUTER_API_KEY) {
		console.warn(
			"OPENROUTER_API_KEY not set — using profile short description fallback",
		);
		return PROFILE_SHORT_DESCRIPTION_FALLBACK;
	}

	const response = await getOpenRouterClient().chat.completions.create({
		model: DEFAULT_MODEL_ID,
		messages: [
			{ role: "system", content: PROFILE_SHORT_DESCRIPTION_SYSTEM_PROMPT },
			{ role: "user", content: buildUserPrompt(profile) },
		],
		temperature: 0.7,
		max_tokens: 80,
	});

	const content = response.choices?.[0]?.message?.content ?? "";
	const normalized = normalizeProfileShortDescription(content);
	if (!normalized) {
		console.error("Failed to parse profile short description:", content);
		throw new ProfileShortDescriptionError(
			"Failed to parse profile short description",
		);
	}

	return normalized;
}
