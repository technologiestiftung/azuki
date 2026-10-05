import data from "../data/popularity-index.json";
import type { PopularityRecord, PopularityTier } from "./popularity";

export const POPULARITY_INDEX: PopularityRecord[] = data as PopularityRecord[];

let tierMap: Map<number, PopularityTier> | null = null;
let recordMap: Map<number, PopularityRecord> | null = null;

export function getPopularityTier(id: number): PopularityTier | undefined {
	if (tierMap === null) {
		tierMap = new Map(POPULARITY_INDEX.map((r) => [r.id, r.popularityTier]));
	}
	return tierMap.get(id);
}

export function getPopularityRecord(id: number): PopularityRecord | undefined {
	if (recordMap === null) {
		recordMap = new Map(POPULARITY_INDEX.map((r) => [r.id, r]));
	}
	return recordMap.get(id);
}
