/**
 * Reads the personas out of 001-seed-personas.sql. The seed is the source of
 * truth; Supabase holds a copy of it, so tooling that parses the file sees the
 * same personas the eval will run without needing database credentials.
 *
 * GUI-created personas exist only in Supabase and are not visible here.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Persona, UserProfile } from "@azuki/shared";
import { UserProfileSchema } from "../../backend/src/schemas/userProfile.js";

const SEED_PATH = resolve(
	fileURLToPath(import.meta.url),
	"../../../backend/eval/migrations/001-seed-personas.sql",
);

export interface SeededPersona {
	id: string;
	name: string;
	profile: UserProfile;
	tierS: number[];
	tierA: number[];
	tierC: number[];
}

/** Ids on a line are comma-separated and may trail a `--` comment. */
function parseIdArray(body: string): number[] {
	return body
		.split("\n")
		.flatMap((line) => line.replace(/--.*$/, "").match(/\d+/g) ?? [])
		.map(Number);
}

export function parseSeededPersonas(seedPath = SEED_PATH): SeededPersona[] {
	const sql = readFileSync(seedPath, "utf-8");
	const out: SeededPersona[] = [];
	for (const block of sql.split(/insert into personas\s*\(/i).slice(1)) {
		const idMatch = block.match(/values\s*\(\s*'([a-z]+)',\s*\n\s*'([^']+)'/i);
		if (!idMatch) continue;
		const jsonStart = block.indexOf("'{");
		const jsonEnd = block.indexOf("'::jsonb", jsonStart);
		const profile = UserProfileSchema.parse(
			JSON.parse(block.slice(jsonStart + 1, jsonEnd).replace(/''/g, "'")),
		);
		const [tierS = [], tierA = [], tierC = []] = [
			...block.matchAll(/ARRAY\[([\s\S]*?)\]::integer\[\]/g),
		].map((m) => parseIdArray(m[1]));
		out.push({
			id: idMatch[1],
			name: idMatch[2],
			profile,
			tierS,
			tierA,
			tierC,
		});
	}
	return out;
}

/** Shape the eval scorer expects. */
export function toPersona(seeded: SeededPersona): Persona {
	return {
		id: seeded.id,
		name: seeded.name,
		description: null,
		profile: seeded.profile,
		tierS: seeded.tierS,
		tierA: seeded.tierA,
		tierC: seeded.tierC,
		createdAt: "",
		updatedAt: "",
	};
}
