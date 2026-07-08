import type { DegreeDistribution } from "@azuki/shared";
import { content } from "../../../content";

type DegreeStatKey = keyof DegreeDistribution;

const DEGREE_STAT_ORDER: DegreeStatKey[] = [
	"noQualification",
	"secondary",
	"intermediate",
	"universityEntrance",
];

const DEGREE_STAT_LABELS: Record<DegreeStatKey, string> = {
	noQualification:
		content["results.detail.schoolDegree.degreeStats.noQualification"],
	secondary: content["results.detail.schoolDegree.degreeStats.secondary"],
	intermediate: content["results.detail.schoolDegree.degreeStats.intermediate"],
	universityEntrance:
		content["results.detail.schoolDegree.degreeStats.universityEntrance"],
};

function predominantDegreeStat(stats: DegreeDistribution): DegreeStatKey {
	let best: DegreeStatKey = "noQualification";
	let bestPct = -1;

	for (const key of DEGREE_STAT_ORDER) {
		if (stats[key] > bestPct) {
			bestPct = stats[key];
			best = key;
		}
	}

	return best;
}

export function formatOccupationDegreeStats(
	degreeStats: DegreeDistribution,
): string {
	return DEGREE_STAT_LABELS[predominantDegreeStat(degreeStats)];
}
