import {
	POPULARITY_INDEX,
	type Persona,
	type PrefilterEntry,
} from "@azuki/shared";

export interface ReachableEntry {
	id: number;
	name: string;
	rank: number;
}

export interface MissedEntry {
	id: number;
	name: string;
}

export interface RubricReachability {
	tierSTotal: number;
	tierSReached: ReachableEntry[];
	tierSMissed: MissedEntry[];
	tierCInPrefilter: ReachableEntry[];
}

let nameByIdCache: Map<number, string> | null = null;

function getNameById(id: number): string {
	if (nameByIdCache === null) {
		nameByIdCache = new Map(POPULARITY_INDEX.map((r) => [r.id, r.name]));
	}
	return nameByIdCache.get(id) ?? `Beruf ${id}`;
}

export function rubricReachability(
	prefilter: PrefilterEntry[],
	persona: Persona,
): RubricReachability {
	const rankById = new Map(prefilter.map((e, i) => [e.id, i + 1]));
	const nameInPrefilter = new Map(prefilter.map((e) => [e.id, e.name]));

	const tierSReached: ReachableEntry[] = [];
	const tierSMissed: MissedEntry[] = [];
	for (const id of persona.tierS) {
		const rank = rankById.get(id);
		if (rank !== undefined) {
			tierSReached.push({
				id,
				name: nameInPrefilter.get(id) ?? getNameById(id),
				rank,
			});
		} else {
			tierSMissed.push({ id, name: getNameById(id) });
		}
	}

	const tierCInPrefilter: ReachableEntry[] = [];
	for (const id of persona.tierC) {
		const rank = rankById.get(id);
		if (rank !== undefined) {
			tierCInPrefilter.push({
				id,
				name: nameInPrefilter.get(id) ?? getNameById(id),
				rank,
			});
		}
	}

	return {
		tierSTotal: persona.tierS.length,
		tierSReached,
		tierSMissed,
		tierCInPrefilter,
	};
}
