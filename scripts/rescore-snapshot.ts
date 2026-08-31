/**
 * Re-scores a saved eval snapshot with the current rubric. No LLM calls, so
 * a rubric change can be checked against real past runs for free instead of
 * paying for a fresh one.
 *
 * Uses the same scoreSnapshot the eval page uses, so what it prints is what
 * the UI would show — never a second copy of the formula.
 *
 * Run: npx tsx scripts/rescore-snapshot.ts <snapshot.json> [more.json ...]
 *
 * A snapshot is the JSON body of POST /api/eval/run: { timestamp, prompt,
 * model, results: { <personaId>: { prefilter, final } } }.
 */
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { EVAL_TOP_N, evalMaxPoints, type EvalSnapshot } from "@azuki/shared";
import { scoreSnapshot } from "../frontend/src/components/eval/scoring.js";
import { parseSeededPersonas, toPersona } from "./lib/seeded-personas.js";

const files = process.argv.slice(2);
if (files.length === 0) {
	console.error(
		"usage: npx tsx scripts/rescore-snapshot.ts <snapshot.json> [more.json ...]",
	);
	process.exit(1);
}

const personas = parseSeededPersonas().map(toPersona);
const personaById = new Map(personas.map((p) => [p.id, p]));

let failed = false;
for (const file of files) {
	const snapshot: EvalSnapshot = JSON.parse(readFileSync(file, "utf-8"));
	if (!snapshot.results || typeof snapshot.results !== "object") {
		console.error(
			`\n${basename(file)}: not an eval snapshot — no "results" object. Bake-off and sweep outputs hold summaries, not per-persona results.`,
		);
		failed = true;
		continue;
	}
	const present = Object.keys(snapshot.results).filter((id) =>
		personaById.has(id),
	);
	const unknown = Object.keys(snapshot.results).filter(
		(id) => !personaById.has(id),
	);

	console.log(
		`\n${basename(file)}  ·  ${snapshot.model}  ·  ${snapshot.timestamp}`,
	);
	if (unknown.length > 0) {
		console.log(`  (not in the seed, skipped: ${unknown.join(", ")})`);
	}

	const reports = scoreSnapshot(
		snapshot,
		present.map((id) => personaById.get(id) as (typeof personas)[number]),
	);

	const rows = present.map((id) => {
		const report = reports[id];
		const persona = personaById.get(id) as (typeof personas)[number];
		// What the ceiling would have been had the ranker filled every slot —
		// the gap shows how much of the score a short list left on the table.
		const fullCeiling = evalMaxPoints(
			persona.tierS.length,
			persona.tierA.length,
			EVAL_TOP_N,
		);
		return {
			persona: id,
			results: `${report.resultCount} / ${EVAL_TOP_N}`,
			"tier S": report.tierSCount,
			"tier A": report.tierACount,
			"tier C": report.tierCCount,
			points: `${report.points} / ${report.maxPoints}`,
			percent: `${report.percent}%`,
			verdict: report.verdict,
			"max if full": fullCeiling,
		};
	});
	console.table(rows);

	const scored = present.map((id) => reports[id].percent);
	if (scored.length > 0) {
		console.log(
			`  run score: ${Math.round(scored.reduce((a, b) => a + b, 0) / scored.length)}%`,
		);
	}
}

if (failed) {
	process.exit(1);
}
