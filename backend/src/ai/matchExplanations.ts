import {
	type MatchSignal,
	type MatchSignalGroups,
	type Occupation,
	type UserProfile,
	DEFAULT_MODEL_ID,
	collectMatchSignals,
	formatOccupationDisplayName,
	resolveOccupationShortDescription,
	resolveOccupationTaskBullets,
} from "@azuki/shared";
import { formatProfileSections, getOpenRouterClient } from "./index.js";
import {
	INTEREST_LABELS,
	NO_GO_LABELS,
	SUBJECT_LABELS,
	STRENGTH_LABELS,
	WORK_EXPECTATION_LABELS,
	WORK_PREF_LABELS,
} from "./labels.js";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MAX_PILLS = 5;
const WEAK_MISMATCH_DIMENSIONS = new Set<MatchSignal["dimension"]>([
	"subjectMismatch",
	"strengthMismatch",
]);
const MAX_WEAK_MISMATCH_SIGNALS = 2;
const STRONG_NOT_MATCH_THRESHOLD = 3;

export interface GeneratedMatchPill {
	id: string;
	label: string;
	icon: string;
	summary: string;
}

export interface MatchExplanationResult {
	matching: GeneratedMatchPill[];
	notMatching: GeneratedMatchPill[];
}

export class MatchExplanationsError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "MatchExplanationsError";
	}
}

const SYSTEM_PROMPT = `AUFGABE
Du erklärst, warum ein Ausbildungsberuf zu einem Jugendlichen passt oder nicht.
Aus Profil-Signalen und Berufsdaten erstellst du zwei Pill-Listen:

1. matching — Gründe, warum der Beruf gut passt (max. ${MAX_PILLS})
2. notMatching — Gründe, warum der Beruf weniger gut passt (max. ${MAX_PILLS})

Jede Pill hat:
- id: kurzer stabiler slug (kleinbuchstaben, bindestriche), z.B. "menschen", "laerm", "kreativ-malerei"
- label: kurzes deutsches Stichwort (1–2 Wörter), das zum Beruf und Signal passt — NICHT generische Kategorie-Namen erzwingen, wenn ein konkreteres Label besser passt
- icon: genau EIN passendes Emoji
- summary: genau 1 kurzer Stichpunkt/Satz, konkret für DIESEN Beruf

HARTE REGELN
- Nutze nur die gelieferten Signale und Berufsdaten. Erfinde keine Profil-Angaben.
- Jede Pill muss klar auf mindestens ein Signal zurückgehen.
- Beziehe dich auf konkrete Aufgaben, Orte oder Bedingungen des Berufs.
- summary wiederholt das label NICHT (weder wörtlich noch als Umschreibung am Satzanfang). Das label steht schon über dem Text — summary ergänzt nur den Berufsaspekt.
- Keine generischen Floskeln („Pflanzen, Erde, Jahreszeiten“, „Computer und digitale Tools“ ohne Bezug).
- „Digitalisierung“ allein reicht NICHT für Technik/Computer — nur bei echtem Bildschirm-/Maschinen-Alltag.
- Dieselbe Aussage und dasselbe Label dürfen nicht in matching UND notMatching vorkommen.
- matching: positiv, konkret, jugendnah.
- notMatching: ehrlich, respektvoll — erkläre den Konflikt.
- Einfache Sprache, kurze Sätze, du-Form.
- Wenn es keine echten Passungsgründe gibt: matching = [].
- Wenn es keine echten Konflikte gibt: notMatching = [].
- Antworte ausschließlich als JSON-Objekt ohne Markdown, ohne Code-Fences.

FORMAT
{
  "matching": [
    { "id": "menschen", "label": "Menschen", "icon": "🤝", "summary": "Du berätst täglich Kundinnen und Kunden an der Rezeption." }
  ],
  "notMatching": [
    { "id": "laerm", "label": "Lärm", "icon": "🔊", "summary": "Maschinen und Werkzeuge machen die Werkstatt oft laut." }
  ]
}`;

function labelOrId(id: string, labels: Record<string, string>): string {
	return labels[id] ?? id;
}

const NO_GO_PILL_LABELS: Record<string, string> = {
	laerm: "Lärm",
	schmutz: "Schmutz",
	schwerstarbeit: "Schwere Arbeit",
	computer: "Computer",
	schichten: "Schichtarbeit",
	tiere: "Tiere",
	gefahr: "Gefahr",
	natur: "Draußen / Natur",
};

function workPrefChoiceLabel(sourceId: string): string {
	const [prefId, choice] = sourceId.split(":");
	const pair = prefId ? WORK_PREF_LABELS[prefId] : undefined;
	if (pair && (choice === "a" || choice === "b")) {
		return pair[choice];
	}
	return sourceId;
}

function formatSignal(signal: MatchSignal): string {
	const weight = `Gewicht ${signal.weight}`;
	const id = signal.sourceId;

	switch (signal.dimension) {
		case "interest":
			return `Interesse „${labelOrId(id, INTEREST_LABELS)}" (${weight})`;
		case "strength":
			return `Stärke „${labelOrId(id, STRENGTH_LABELS)}" (${weight})`;
		case "subject":
			return `Lieblingsfach „${labelOrId(id, SUBJECT_LABELS)}" (${weight})`;
		case "workPref":
			return `Arbeitsvorliebe „${workPrefChoiceLabel(id)}" passt (${weight})`;
		case "expectation":
			return `Erwartung „${labelOrId(id, WORK_EXPECTATION_LABELS)}" passt (${weight})`;
		case "noGo":
			return `No-Go „${NO_GO_LABELS[id] ?? labelOrId(id, NO_GO_PILL_LABELS)}" trifft zu (${weight})`;
		case "outdoorMismatch":
			return `Konflikt: lieber drinnen, Beruf hat Outdoor-Anteil (${weight})`;
		case "workPrefMismatch":
			return `Arbeitsvorliebe „${workPrefChoiceLabel(id)}" widerspricht dem Beruf (${weight})`;
		case "expectationMismatch":
			return `Erwartung „${labelOrId(id, WORK_EXPECTATION_LABELS)}" wird nicht erfüllt (${weight})`;
		case "subjectMismatch":
			return `Lieblingsfach „${labelOrId(id, SUBJECT_LABELS)}" wird hier wenig gebraucht (${weight})`;
		case "strengthMismatch":
			return `Stärke „${labelOrId(id, STRENGTH_LABELS)}" wird hier wenig gebraucht (${weight})`;
		default:
			return `${signal.dimension}:${id} (${weight})`;
	}
}

function formatSignalList(title: string, signals: MatchSignal[]): string {
	if (signals.length === 0) {
		return `${title}: (keine)`;
	}
	const sorted = [...signals].sort((a, b) => b.weight - a.weight);
	return `${title}:\n${sorted.map((s) => `- ${formatSignal(s)}`).join("\n")}`;
}

function formatOccupationBlock(occupation: Occupation): string {
	const name = formatOccupationDisplayName(occupation.name);
	const shortDescription = resolveOccupationShortDescription(occupation);
	const taskBullets = resolveOccupationTaskBullets(occupation);
	const conditions = Object.entries(occupation.conditions)
		.filter(([, value]) => value)
		.map(([key]) => key)
		.join(", ");

	let tasksLine: string | null = null;
	if (taskBullets.length > 0) {
		tasksLine = `Typische Aufgaben:\n${taskBullets.map((b) => `- ${b}`).join("\n")}`;
	} else if (occupation.taskSummary) {
		tasksLine = `Aufgaben: ${occupation.taskSummary.slice(0, 500)}`;
	}

	const parts = [
		`Beruf: ${name}`,
		shortDescription ? `Kurzbeschreibung: ${shortDescription}` : null,
		tasksLine,
		occupation.workLocations
			? `Arbeitsorte: ${occupation.workLocations.slice(0, 300)}`
			: null,
		conditions ? `Arbeitsbedingungen (Flags): ${conditions}` : null,
	].filter((line): line is string => line !== null);

	return parts.join("\n");
}

/** Drop weak subject/strength mismatches when stronger conflicts already fill the list. */
export function selectSignalsForPrompt(
	signals: MatchSignalGroups,
): MatchSignalGroups {
	const strong = signals.notMatching.filter(
		(s) => !WEAK_MISMATCH_DIMENSIONS.has(s.dimension),
	);
	const weak = signals.notMatching
		.filter((s) => WEAK_MISMATCH_DIMENSIONS.has(s.dimension))
		.sort((a, b) => b.weight - a.weight);

	if (strong.length >= STRONG_NOT_MATCH_THRESHOLD) {
		return { matching: signals.matching, notMatching: strong };
	}

	const weakSlots = Math.min(
		MAX_WEAK_MISMATCH_SIGNALS,
		STRONG_NOT_MATCH_THRESHOLD - strong.length,
	);
	return {
		matching: signals.matching,
		notMatching: [...strong, ...weak.slice(0, weakSlots)],
	};
}

function buildUserPrompt(
	occupation: Occupation,
	profile: UserProfile,
	signals: MatchSignalGroups,
): string {
	const forPrompt = selectSignalsForPrompt(signals);
	return `PROFIL DES JUGENDLICHEN:
${formatProfileSections(profile)}

BERUF:
${formatOccupationBlock(occupation)}

${formatSignalList("PASSENDE SIGNALE (für matching-Pills)", forPrompt.matching)}

${formatSignalList("KONFLIKT-SIGNALE (für notMatching-Pills)", forPrompt.notMatching)}

Erstelle daraus die Pill-Listen mit id, label, icon und summary.`;
}

function firstGrapheme(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) {
		return "";
	}
	if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
		const segmenter = new Intl.Segmenter(undefined, {
			granularity: "grapheme",
		});
		const first = segmenter.segment(trimmed)[Symbol.iterator]().next().value;
		if (first?.segment) {
			return first.segment;
		}
	}
	return [...trimmed][0] ?? trimmed;
}

function normalizePill(
	raw: unknown,
	prefix: "match" | "not-match",
	index: number,
): GeneratedMatchPill | null {
	if (!raw || typeof raw !== "object") {
		return null;
	}
	const pill = raw as Record<string, unknown>;
	const label = typeof pill.label === "string" ? pill.label.trim() : "";
	const summary = typeof pill.summary === "string" ? pill.summary.trim() : "";
	if (!label || !summary) {
		return null;
	}
	const rawId = typeof pill.id === "string" ? pill.id.trim() : "";
	const slug =
		rawId
			.toLowerCase()
			.replace(/[^a-z0-9äöüß-]+/gi, "-")
			.replace(/^-+|-+$/g, "") || `pill-${index + 1}`;
	let icon = prefix === "match" ? "✨" : "⚠️";
	if (typeof pill.icon === "string" && pill.icon.trim()) {
		const grapheme = firstGrapheme(pill.icon);
		if (grapheme) {
			icon = grapheme;
		}
	}
	return {
		id: `${prefix}-${slug}`,
		label: label.slice(0, 40),
		icon,
		summary,
	};
}

/** Strip markdown fences / leading prose so JSON.parse can succeed. */
export function unwrapJsonContent(content: string): string {
	let text = content.trim();
	const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(text);
	if (fenced?.[1]) {
		text = fenced[1].trim();
	}
	if (!text.startsWith("{")) {
		const start = text.indexOf("{");
		const end = text.lastIndexOf("}");
		if (start >= 0 && end > start) {
			text = text.slice(start, end + 1);
		}
	}
	return text;
}

function extractPills(content: string): MatchExplanationResult | null {
	try {
		const parsed = JSON.parse(unwrapJsonContent(content)) as {
			matching?: unknown;
			notMatching?: unknown;
		};
		const matchingRaw = Array.isArray(parsed.matching) ? parsed.matching : [];
		const notMatchingRaw = Array.isArray(parsed.notMatching)
			? parsed.notMatching
			: [];

		const matching = matchingRaw
			.map((pill, index) => normalizePill(pill, "match", index))
			.filter((pill): pill is GeneratedMatchPill => pill !== null)
			.slice(0, MAX_PILLS);
		const notMatching = notMatchingRaw
			.map((pill, index) => normalizePill(pill, "not-match", index))
			.filter((pill): pill is GeneratedMatchPill => pill !== null)
			.slice(0, MAX_PILLS);

		return { matching, notMatching };
	} catch {
		return null;
	}
}

export function dedupeLabelsAcrossSections(
	result: MatchExplanationResult,
): MatchExplanationResult {
	const notMatchLabels = new Set(
		result.notMatching.map((pill) => pill.label.toLowerCase()),
	);
	return {
		matching: result.matching.filter(
			(pill) => !notMatchLabels.has(pill.label.toLowerCase()),
		),
		notMatching: result.notMatching,
	};
}

/** Parse and normalize LLM JSON into pill lists (for tests + generate). */
export function parseMatchExplanationContent(
	content: string,
): MatchExplanationResult | null {
	const pills = extractPills(content);
	if (!pills) {
		return null;
	}
	return dedupeLabelsAcrossSections(pills);
}

export async function generateMatchExplanations(
	occupation: Occupation,
	profile: UserProfile,
): Promise<MatchExplanationResult> {
	const signals = collectMatchSignals(profile, occupation);
	if (signals.matching.length === 0 && signals.notMatching.length === 0) {
		return { matching: [], notMatching: [] };
	}

	if (!OPENROUTER_API_KEY) {
		console.warn(
			"OPENROUTER_API_KEY not set — skipping match explanation generation",
		);
		throw new MatchExplanationsError("OPENROUTER_API_KEY not set");
	}

	const response = await getOpenRouterClient().chat.completions.create({
		model: DEFAULT_MODEL_ID,
		messages: [
			{ role: "system", content: SYSTEM_PROMPT },
			{ role: "user", content: buildUserPrompt(occupation, profile, signals) },
		],
		temperature: 0.4,
		response_format: { type: "json_object" },
	});

	const content = response.choices?.[0]?.message?.content ?? "";
	const pills = parseMatchExplanationContent(content);
	if (!pills) {
		console.error("Failed to parse match explanations:", content);
		throw new MatchExplanationsError("Failed to parse match explanations");
	}

	return pills;
}
