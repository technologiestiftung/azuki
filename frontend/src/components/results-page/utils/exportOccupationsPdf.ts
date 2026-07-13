import {
	formatOccupationDisplayName,
	type MatchedOccupation,
} from "@azuki/shared";
import { content } from "../../../content";
import { fitPercent } from "./fitPercent";
import { exportPdfTable } from "./exportPdfTable";

const TABLE_HEADERS = [
	content["results.export.occupation"],
	content["results.export.fit"],
	content["results.export.duration"],
	content["results.export.earnings"],
	content["results.export.description"],
] as const;

export function exportOccupationsPdf(occupations: MatchedOccupation[]): void {
	if (occupations.length === 0) {
		return;
	}

	exportPdfTable({
		filename: content["results.export.filename"],
		title: content["results.title"],
		head: [...TABLE_HEADERS],
		body: occupations.map((occupation) => [
			formatOccupationDisplayName(occupation.name),
			`${fitPercent(occupation.score)}%`,
			occupation.occupationDuration,
			occupation.occupationEarnings,
			occupation.shortDescription,
		]),
		columnWeights: [2.5, 1, 1.2, 1.2, 3],
	});
}
