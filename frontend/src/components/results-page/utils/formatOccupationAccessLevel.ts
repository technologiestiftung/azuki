import type { AccessLevel } from "@azuki/shared";
import { content } from "../../../content";

const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
	unrestricted: content["results.detail.schoolDegree.accessLevel.unrestricted"],
	hauptschule: content["results.detail.schoolDegree.accessLevel.hauptschule"],
	realschule: content["results.detail.schoolDegree.accessLevel.realschule"],
	fachhochschulreife:
		content["results.detail.schoolDegree.accessLevel.fachhochschulreife"],
};

export function formatOccupationAccessLevel(
	accessLevel: AccessLevel | null | undefined,
): string {
	if (!accessLevel) {
		return content["results.detail.schoolDegree.accessLevel.unknown"];
	}
	return ACCESS_LEVEL_LABELS[accessLevel];
}
