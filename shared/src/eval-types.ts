import type { OccupationImage, GenerationInfo } from "./types";

export type PersonaId = "nico" | "elina" | "karim";

export interface PrefilterEntry {
	id: number;
	name: string;
	score: number;
}

export interface FinalEntry {
	id: number;
	name: string;
	score: number;
	reasoning: string;
	images?: OccupationImage[];
	taskSummary?: string;
}

export type PersonaResult =
	| {
			prefilter: PrefilterEntry[];
			final: FinalEntry[];
			generation?: GenerationInfo;
	  }
	| { error: string };

export interface EvalSnapshot {
	timestamp: string; // ISO 8601
	prompt: string;
	model: string;
	results: Record<PersonaId, PersonaResult>;
}

