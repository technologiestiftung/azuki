import type { Persona, PrefilterEntry } from "@azuki/shared";

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
	/** How many candidates the prefilter actually shortlisted. */
	prefilterSize: number;
	tierSTotal: number;
	tierSReached: ReachableEntry[];
	tierSMissed: MissedEntry[];
	tierCInPrefilter: ReachableEntry[];
}

export function rubricReachability(
	prefilter: PrefilterEntry[],
	persona: Persona,
	nameById: ReadonlyMap<number, string>,
): RubricReachability {
	const nameOf = (id: number) => nameById.get(id) ?? `Beruf ${id}`;
	const rankById = new Map(prefilter.map((e, i) => [e.id, i + 1]));
	const nameInPrefilter = new Map(prefilter.map((e) => [e.id, e.name]));

	const tierSReached: ReachableEntry[] = [];
	const tierSMissed: MissedEntry[] = [];
	for (const id of persona.tierS) {
		const rank = rankById.get(id);
		if (rank !== undefined) {
			tierSReached.push({
				id,
				name: nameInPrefilter.get(id) ?? nameOf(id),
				rank,
			});
		} else {
			tierSMissed.push({ id, name: nameOf(id) });
		}
	}

	const tierCInPrefilter: ReachableEntry[] = [];
	for (const id of persona.tierC) {
		const rank = rankById.get(id);
		if (rank !== undefined) {
			tierCInPrefilter.push({
				id,
				name: nameInPrefilter.get(id) ?? nameOf(id),
				rank,
			});
		}
	}

	return {
		prefilterSize: prefilter.length,
		tierSTotal: persona.tierS.length,
		tierSReached,
		tierSMissed,
		tierCInPrefilter,
	};
}
