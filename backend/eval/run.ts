import type {
	EvalSnapshot,
	PersonaResult,
	Persona,
	Occupation,
} from "@azuki/shared";
import { preFilter, PREFILTER_TOP_K } from "../src/matching/index.js";
import { aiRank } from "../src/ai/index.js";
export interface RunEvalOptions {
	systemPrompt: string;
	model: string;
	occupations: Occupation[];
	personas: Persona[];
	/**
	 * When true, the LLM candidate list includes a "Hinweise" line per
	 * Beruf with the popularity-tier signal and the parsed accessLevel
	 * phrasing. Used together with the v3 system prompt that instructs
	 * the model how to read these signals. Defaults to false.
	 */
	withContext?: boolean;
	/**
	 * Number of preFilter candidates to forward to the LLM ranker.
	 * Defaults to PREFILTER_TOP_K. Callers sweeping K must also rebuild
	 * the systemPrompt with the same K so the prompt text matches the
	 * candidate-list size the LLM actually sees.
	 */
	k?: number;
}

export async function runEval(opts: RunEvalOptions): Promise<EvalSnapshot> {
	const { systemPrompt, model, occupations, personas, withContext } = opts;
	const k = opts.k ?? PREFILTER_TOP_K;

	const personaPromises = personas.map(
		async (persona): Promise<[string, PersonaResult]> => {
			try {
				const topCandidates = preFilter(occupations, persona.profile, k);

				const matchResult = await aiRank(topCandidates, persona.profile, {
					systemPrompt,
					model,
					withContext,
				});

				const prefilter = topCandidates.map((entry) => ({
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
					shortDescription: occ.shortDescription,
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
