import { PERSONA_IDS, PERSONAS } from "@azuki/shared";
import { preFilter } from "../src/matching/index.js";
import { aiRank } from "../src/ai/index.js";
export async function runEval(opts) {
    const { systemPrompt, model, occupations } = opts;
    const personaPromises = PERSONA_IDS.map(async (personaId) => {
        try {
            const profile = PERSONAS[personaId];
            const top40 = preFilter(occupations, profile, 40);
            const matchResult = await aiRank(top40, profile, {
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
                personaId,
                {
                    prefilter,
                    final,
                    generation: matchResult.generation,
                },
            ];
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return [personaId, { error: message }];
        }
    });
    const settled = await Promise.all(personaPromises);
    const results = {};
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
