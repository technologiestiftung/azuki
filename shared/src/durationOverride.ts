import data from "../data/duration-overrides.json";

const overrides = data as Record<string, string>;

/** Curated Ausbildungsdauer (from the Joblinge annotation) for an occupation id, if any. */
export function getDurationOverride(id: number): string | undefined {
	return overrides[String(id)];
}
