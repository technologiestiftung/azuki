import type { Beruf, UserProfile } from "../types.js";
import { scoreBeruf } from "./score.js";

export interface ScoredBeruf {
	beruf: Beruf;
	score: number;
}

export function grobFilter(
	berufe: Beruf[],
	profile: UserProfile,
	topN: number = 30,
): ScoredBeruf[] {
	const scored: ScoredBeruf[] = berufe.map((beruf) => ({
		beruf,
		score: scoreBeruf(beruf, profile),
	}));

	scored.sort((a, b) => b.score - a.score);

	return scored.slice(0, topN);
}
