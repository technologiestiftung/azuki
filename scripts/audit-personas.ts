/**
 * Static health check for the eval personas — runs the prefilter only, never
 * the LLM, so it costs nothing to run after a catalog refresh.
 *
 * Reports, per persona seeded in 001-seed-personas.sql:
 *  - tier ids the catalog no longer carries (they can never be returned, so
 *    they silently lower the reachable score) — these fail the run
 *  - how many Tier S/A entries survive the prefilter shortlist
 *  - Tier C entries inside the shortlist, with their rank (any that reaches
 *    the final top-N is an automatic FAIL)
 *  - the resulting score ceiling: what a flawless ranker could score
 *  - whether each persona's free-text fields survive UserProfileSchema and
 *    reach the LLM prompt — a profile written against a superseded schema
 *    parses without error but silently drops those fields
 *
 * GUI-created personas live only in Supabase and are not covered here.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { EVAL_TOP_N, evalMaxPoints, type Occupation } from "@azuki/shared";
import { buildUserPrompt } from "../backend/src/ai/index.js";
import { preFilter, PREFILTER_TOP_K } from "../backend/src/matching/index.js";
import { parseSeededPersonas } from "./lib/seeded-personas.js";

const here = resolve(fileURLToPath(import.meta.url), "..");
const occupations: Occupation[] = JSON.parse(
	readFileSync(resolve(here, "../backend/src/data/berufe.json"), "utf-8"),
);
const catalog = new Map(occupations.map((o) => [o.id, o.name]));

/**
 * Free-text fields the LLM prompt is meant to carry, with the marker each one
 * produces in buildUserPrompt. A profile still written against a superseded
 * schema (secretTalent, practicalExperience) parses fine — Zod strips the
 * unknown key and defaults the current one to empty — so the text simply
 * never reaches the model. Only an absent marker reveals it.
 */
const PROMPT_SIGNALS: [label: string, marker: RegExp][] = [
	["strengths", /Weitere Stärken \(eigene Angaben\):/],
	["experience", /Praktische Erfahrungen \(eigene Angaben\):/],
];

const personas = parseSeededPersonas();
const rows = [];
const tierCDetail: string[] = [];
const deadIds: string[] = [];
const droppedSignals: string[] = [];

for (const persona of personas) {
	const profile = persona.profile;
	const shortlist = preFilter(occupations, profile, PREFILTER_TOP_K);
	const rankById = new Map(shortlist.map((s, i) => [s.occupation.id, i + 1]));

	for (const [tier, ids] of [
		["S", persona.tierS],
		["A", persona.tierA],
		["C", persona.tierC],
	] as const) {
		for (const id of ids) {
			if (!catalog.has(id)) deadIds.push(`${persona.id} tier${tier} ${id}`);
		}
	}

	const reached = (ids: number[]) =>
		ids.filter((id) => catalog.has(id) && rankById.has(id)).length;
	const tierSReached = reached(persona.tierS);
	const tierAReached = reached(persona.tierA);

	const ceilingPoints = (topN: number) => {
		const s = Math.min(tierSReached, topN);
		return s * 2 + Math.min(tierAReached, topN - s);
	};
	const maxPoints = evalMaxPoints(persona.tierS.length, persona.tierA.length);

	const prompt = buildUserPrompt([], profile);
	const missingSignals = PROMPT_SIGNALS.filter(
		([, marker]) => !marker.test(prompt),
	).map(([label]) => label);
	for (const label of missingSignals) {
		droppedSignals.push(`${persona.id} ${label}`);
	}

	const cHits = persona.tierC
		.map((id) => rankById.get(id))
		.filter((r): r is number => r !== undefined)
		.sort((a, b) => a - b);
	tierCDetail.push(
		`  ${persona.id.padEnd(6)} ${String(cHits.length).padStart(2)} in shortlist` +
			(cHits.length > 0 ? ` (ranks ${cHits.join(",")})` : ""),
	);

	rows.push({
		persona: persona.id,
		tierS: persona.tierS.length,
		"S reached": tierSReached,
		tierA: persona.tierA.length,
		"A reached": tierAReached,
		tierC: persona.tierC.length,
		"C in shortlist": cHits.length,
		"max points": maxPoints,
		ceiling:
			maxPoints === 0
				? "n/a"
				: `${Math.round((ceilingPoints(EVAL_TOP_N) / maxPoints) * 100)}%`,
		"prompt text":
			missingSignals.length === 0
				? "ok"
				: `DROPPED: ${missingSignals.join(",")}`,
	});
}

console.log(
	`catalog ${catalog.size} occupations · prefilter top ${PREFILTER_TOP_K} · scored top ${EVAL_TOP_N}\n`,
);
console.table(rows);

console.log(
	`\nTier C inside the prefilter shortlist (any that survives into the top ${EVAL_TOP_N} is an automatic FAIL):`,
);
console.log(tierCDetail.join("\n"));

const ceilings = rows
	.filter((r) => r.ceiling !== "n/a")
	.map((r) => Number(r.ceiling.replace("%", "")));
console.log(
	`\nRun-score ceiling (mean of persona ceilings): ${Math.round(
		ceilings.reduce((a, b) => a + b, 0) / ceilings.length,
	)}%`,
);

let failed = false;
if (deadIds.length > 0) {
	console.error(
		`\nFAIL: ${deadIds.length} tier id(s) are not in berufe.json — they can never be returned:\n  ${deadIds.join("\n  ")}`,
	);
	failed = true;
}
if (droppedSignals.length > 0) {
	console.error(
		`\nFAIL: ${droppedSignals.length} free-text field(s) never reach the prompt — the profile is written against a superseded schema:\n  ${droppedSignals.join("\n  ")}`,
	);
	failed = true;
}
if (failed) {
	process.exit(1);
}
console.log(
	"\nOK: every tier id exists in the catalog, and every persona's free-text fields reach the prompt.",
);
