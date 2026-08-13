import type { AccessLevel } from "@azuki/shared";
import { content } from "../../../content";

const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
	unrestricted: content["schoolDegree.option.none.label"],
	hauptschule: content["schoolDegree.option.secondary.label"],
	realschule: content["schoolDegree.option.intermediate.label"],
	fachhochschulreife: content["schoolDegree.option.vocationalDiploma.label"],
};

export function formatOccupationAccessLevel(
	accessLevel: AccessLevel | null | undefined,
): string {
	if (!accessLevel) {
		return content["results.detail.schoolDegree.accessLevel.unknown"];
	}
	return ACCESS_LEVEL_LABELS[accessLevel];
}
