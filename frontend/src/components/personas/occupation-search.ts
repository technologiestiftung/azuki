import type { PopularityRecord, PopularityTier } from "@azuki/shared";

export interface SearchOptions {
	query?: string;
	tier?: PopularityTier;
	limit?: number;
}

export interface SearchResult {
	results: PopularityRecord[];
	total: number;
}

const DEFAULT_LIMIT = 50;

export function searchOccupations(
	records: PopularityRecord[],
	options: SearchOptions,
): SearchResult {
	const q = (options.query ?? "").trim().toLowerCase();
	const tier = options.tier;
	const limit = options.limit ?? DEFAULT_LIMIT;

	const filtered = records.filter((r) => {
		if (q && !r.name.toLowerCase().includes(q)) {
			return false;
		}
		if (tier && r.popularityTier !== tier) {
			return false;
		}
		return true;
	});

	filtered.sort((a, b) => a.name.localeCompare(b.name, "de"));
	return {
		results: filtered.slice(0, limit),
		total: filtered.length,
	};
}
