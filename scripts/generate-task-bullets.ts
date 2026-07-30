/**
 * Generates youth-friendly taskBullets fields for all occupations in
 * berufe.json using OpenRouter. Resumable: skips entries that already have them.
 *
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
	type Occupation,
	DEFAULT_MODEL_ID,
	TASK_BULLETS_PROMPT,
} from "@azuki/shared";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BERUFE_PATH = resolve(__dirname, "../backend/src/data/berufe.json");
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = DEFAULT_MODEL_ID;
const BATCH_SIZE = 15;
const MAX_SOURCE_LENGTH = 500;
const DELAY_MS = 500;
const MAX_BULLETS = 4;

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseArgs(): { limit?: number; force: boolean } {
	const args = process.argv.slice(2);
	let limit: number | undefined;
	let force = false;
	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--limit" && args[i + 1]) {
			limit = parseInt(args[i + 1], 10);
			i++;
		} else if (args[i] === "--force") {
			force = true;
		}
	}
	return { limit, force };
}

function truncate(text: string | null | undefined): string {
	if (!text) {
		return "";
	}
	const trimmed = text.trim();
	if (trimmed.length <= MAX_SOURCE_LENGTH) {
		return trimmed;
	}
	return `${trimmed.slice(0, MAX_SOURCE_LENGTH)}...`;
}

function formatBatch(occupations: Occupation[]): string {
	return occupations
		.map((occ) => {
			const source =
				occ.taskSummary ||
				occ.competenciesText ||
				occ.descriptionLong ||
				occ.name;
			const shortHint = occ.shortDescription?.trim();
			return `[ID: ${occ.id}] ${occ.name}${shortHint ? `\nKurzdefinition: ${shortHint}` : ""}\nAufgaben: ${truncate(source)}`;
		})
		.join("\n\n");
}

interface BatchEntry {
	id: number;
	taskBullets: string[];
}

function normalizeBullets(value: unknown): string[] | null {
	if (!Array.isArray(value)) {
		return null;
	}
	const bullets = value
		.filter((item): item is string => typeof item === "string")
		.map((item) => item.trim())
		.filter(Boolean)
		.slice(0, MAX_BULLETS);
	return bullets.length > 0 ? bullets : null;
}

function parseBatchResponse(content: string): BatchEntry[] | null {
	if (!content) {
		return null;
	}
	// eslint-disable-next-line no-control-regex
	const sanitized = content.replace(/[\x00-\x1F\x7F]/g, "");
	const fenceMatch = sanitized.match(/```(?:json)?\s*([\s\S]*?)```/);
	const jsonText = fenceMatch ? fenceMatch[1] : sanitized;

	try {
		const parsed = JSON.parse(jsonText) as {
			entries?: unknown;
			taskBullets?: unknown;
		};
		const raw = parsed.entries ?? parsed.taskBullets;
		if (!Array.isArray(raw)) {
			return null;
		}
		const entries: BatchEntry[] = [];
		for (const item of raw) {
			if (typeof item !== "object" || item === null) {
				continue;
			}
			const id = (item as { id?: unknown }).id;
			const bullets = normalizeBullets(
				(item as { taskBullets?: unknown }).taskBullets,
			);
			if (typeof id === "number" && bullets) {
				entries.push({ id, taskBullets: bullets });
			}
		}
		return entries.length > 0 ? entries : null;
	} catch {
		return null;
	}
}

async function generateBatch(
	occupations: Occupation[],
): Promise<Map<number, string[]>> {
	const response = await fetch(
		"https://openrouter.ai/api/v1/chat/completions",
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${OPENROUTER_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: MODEL,
				messages: [
					{
						role: "system",
						content: `${TASK_BULLETS_PROMPT}

Du bekommst mehrere Berufe und schreibst für jeden 2 bis 4 Stichpunkte zu typischen Aufgaben.
Antworte ausschließlich als JSON-Objekt mit dem Schlüssel "entries", dessen Wert ein Array ist. Ohne Markdown, ohne Vorrede.
Format:
{
  "entries": [
    { "id": 12345, "taskBullets": ["...", "...", "..."] },
    { "id": 67890, "taskBullets": ["...", "..."] }
  ]
}`,
					},
					{
						role: "user",
						content: `Schreibe für jeden Beruf typische Aufgaben als Stichpunkte:\n\n${formatBatch(occupations)}`,
					},
				],
				temperature: 0.3,
				response_format: { type: "json_object" },
			}),
		},
	);

	if (!response.ok) {
		const body = await response.text();
		throw new Error(`OpenRouter ${response.status}: ${body}`);
	}

	const data = (await response.json()) as {
		choices?: Array<{ message?: { content?: string } }>;
	};
	const content = data.choices?.[0]?.message?.content ?? "";
	const entries = parseBatchResponse(content);
	if (!entries) {
		throw new Error(`Failed to parse batch response: ${content.slice(0, 300)}`);
	}

	const expectedIds = new Set(occupations.map((o) => o.id));
	const result = new Map<number, string[]>();
	for (const entry of entries) {
		if (!expectedIds.has(entry.id) || entry.taskBullets.length === 0) {
			continue;
		}
		result.set(entry.id, entry.taskBullets);
	}

	if (result.size === 0) {
		throw new Error("Batch returned no matching entries");
	}
	return result;
}

function hasTaskBullets(occupation: Occupation): boolean {
	return (
		(occupation.taskBullets?.filter((bullet) => bullet.trim()).length ?? 0) > 0
	);
}

async function main() {
	const { limit, force } = parseArgs();

	if (!OPENROUTER_API_KEY) {
		throw new Error(
			"OPENROUTER_API_KEY is required. Set it in backend/.env or pass via --env-file.",
		);
	}

	console.log("=== Generate taskBullets for berufe.json ===\n");
	console.log(`Model: ${MODEL}`);
	console.log(`Batch size: ${BATCH_SIZE}\n`);

	const occupations: Occupation[] = JSON.parse(
		readFileSync(BERUFE_PATH, "utf-8"),
	);

	let pending = occupations.filter((occ) => force || !hasTaskBullets(occ));
	if (limit !== undefined) {
		pending = pending.slice(0, limit);
	}

	console.log(
		`${pending.length} occupation(s) to process (${occupations.length} total).\n`,
	);

	if (pending.length === 0) {
		console.log("Nothing to do.");
		return;
	}

	let generated = 0;
	for (let i = 0; i < pending.length; i += BATCH_SIZE) {
		const batch = pending.slice(i, i + BATCH_SIZE);
		const batchNum = Math.floor(i / BATCH_SIZE) + 1;
		const totalBatches = Math.ceil(pending.length / BATCH_SIZE);
		console.log(
			`Batch ${batchNum}/${totalBatches} (${batch.length} occupations)...`,
		);

		const taskBulletsById = await generateBatch(batch);
		for (const occ of occupations) {
			const bullets = taskBulletsById.get(occ.id);
			if (bullets) {
				occ.taskBullets = bullets;
				generated++;
			}
		}

		writeFileSync(BERUFE_PATH, JSON.stringify(occupations, null, 2), "utf-8");
		console.log(
			`  -> wrote ${taskBulletsById.size} task bullet set(s) (${generated} total so far)`,
		);

		if (i + BATCH_SIZE < pending.length) {
			await sleep(DELAY_MS);
		}
	}

	const withBullets = occupations.filter(hasTaskBullets).length;
	console.log(`\nDone. ${withBullets}/${occupations.length} have taskBullets.`);
	console.log(`Saved to ${BERUFE_PATH}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((err) => {
		console.error(err);
		process.exit(1);
	});
}
