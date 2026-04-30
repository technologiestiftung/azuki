import type { Criterion } from "./types";
import type { PopularityTier } from "../popularity";

export function minTierSInTop8(n: number, tierS: number[]): Criterion {
	const tierSSet = new Set(tierS);
	return {
		name: `≥${n} Tier S in top 8`,
		check: (top8) => {
			const matches = top8.filter((e) => tierSSet.has(e.id));
			const count = matches.length;
			return {
				name: `≥${n} Tier S in top 8`,
				passed: count >= n,
				details:
					count >= n
						? `${count} of ${tierS.length} Tier S entries appear in top 8`
						: `Only ${count} Tier S entries in top 8 (need ${n})`,
			};
		},
	};
}

export function noTierCInTop8(tierC: number[]): Criterion {
	const tierCSet = new Set(tierC);
	return {
		name: "0 Tier C in top 8",
		hardFail: true,
		check: (top8) => {
			const offenders = top8.filter((e) => tierCSet.has(e.id));
			return {
				name: "0 Tier C in top 8",
				hardFail: true,
				passed: offenders.length === 0,
				details:
					offenders.length === 0
						? "No Tier C entries in top 8"
						: `Tier C entries in top 8: ${offenders.map((o) => o.name).join(", ")}`,
			};
		},
	};
}

export function firstResultFromSet(
	set: number[],
	label: string,
): Criterion {
	const setLookup = new Set(set);
	return {
		name: label,
		check: (top8) => {
			const first = top8[0];
			if (!first) {
				return {
					name: label,
					passed: false,
					details: "Top 8 is empty",
				};
			}
			const passed = setLookup.has(first.id);
			return {
				name: label,
				passed,
				details: passed
					? `#1 is "${first.name}" (in expected set)`
					: `#1 is "${first.name}" (not in expected set)`,
			};
		},
	};
}

export function atLeastOneInTop5(
	set: number[],
	label: string,
): Criterion {
	const setLookup = new Set(set);
	return {
		name: label,
		check: (_top8, top5) => {
			const matches = top5.filter((e) => setLookup.has(e.id));
			return {
				name: label,
				passed: matches.length > 0,
				details:
					matches.length > 0
						? `Top 5 includes: ${matches.map((m) => m.name).join(", ")}`
						: "None of the expected entries appear in top 5",
			};
		},
	};
}

export function atLeastOneOfPopularityTier(
	tier: PopularityTier,
	label: string,
): Criterion {
	return {
		name: label,
		check: (top8, _top5, getTier) => {
			const matches = top8.filter((e) => getTier(e.id) === tier);
			return {
				name: label,
				passed: matches.length > 0,
				details:
					matches.length > 0
						? `Top 8 includes ${matches.length} ${tier} entry/entries: ${matches.map((m) => m.name).join(", ")}`
						: `No ${tier} entry in top 8`,
			};
		},
	};
}

export interface Subcategory {
	name: string;
	ids: number[];
}

export function atLeastOneFromEachSubcategory(
	subcategories: Subcategory[],
	label: string,
): Criterion {
	return {
		name: label,
		check: (top8) => {
			const missing: string[] = [];
			const hits: string[] = [];
			for (const sub of subcategories) {
				const set = new Set(sub.ids);
				const hit = top8.find((e) => set.has(e.id));
				if (hit) {
					hits.push(`${sub.name}: ${hit.name}`);
				} else {
					missing.push(sub.name);
				}
			}
			const passed = missing.length === 0;
			return {
				name: label,
				passed,
				details: passed
					? `All subcategories covered (${hits.join("; ")})`
					: `Missing: ${missing.join(", ")}`,
			};
		},
	};
}
