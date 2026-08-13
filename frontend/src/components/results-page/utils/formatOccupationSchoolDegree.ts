import type { AccessLevel, DegreeDistribution } from "@azuki/shared";
import { formatOccupationAccessLevel } from "./formatOccupationAccessLevel";
import { formatOccupationDegreeStats } from "./formatOccupationDegreeStats";

export function formatOccupationSchoolDegree(
	degreeStats: DegreeDistribution | null | undefined,
	accessLevel: AccessLevel | null | undefined,
): string {
	if (degreeStats) {
		return formatOccupationDegreeStats(degreeStats);
	}

	return formatOccupationAccessLevel(accessLevel);
}
