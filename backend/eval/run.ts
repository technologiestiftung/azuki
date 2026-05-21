import type {
	EvalSnapshot,
	PersonaResult,
	Persona,
	Occupation,
} from "@azuki/shared";
import { preFilter } from "../src/matching/index.js";
import { aiRank } from "../src/ai/index.js";
export interface RunEvalOptions {
	systemPrompt: string;
	model: string;
	occupations: Occupation[];
	personas: Persona[];
}

export async function runEval(opts: RunEvalOptions): Promise<EvalSnapshot> {
	const { systemPrompt, model, occupations, personas } = opts;

	const personaPromises = personas.map(
		async (persona): Promise<[string, PersonaResult]> => {
			try {
				const top40 = preFilter(occupations, persona.profile, 40);

				const matchResult = await aiRank(top40, persona.profile, {
					systemPrompt,
					model,
				});

				const prefilter = top40.map((entry) => ({
					id: entry.occupation.id,
					name: entry.occupation.name,
					score: entry.score,
				}));

				const final = matchResult.occupations.map((occ) => ({
					id: occ.id,
					name: occ.name,
					score: occ.score,
					reasoning: occ.reasoning,
					images: occ.images,
					taskSummary: occ.taskSummary,
				}));

				return [
					persona.id,
					{
						prefilter,
						final,
						generation: matchResult.generation,
					},
				];
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				return [persona.id, { error: message }];
			}
		},
	);

	const settled = await Promise.all(personaPromises);
	const results: Record<string, PersonaResult> = {};
	for (const [id, result] of settled) {
		results[id] = result;
	}

	return {
		timestamp: new Date().toISOString(),
		prompt: systemPrompt,
		model,
		results,
	};
}
