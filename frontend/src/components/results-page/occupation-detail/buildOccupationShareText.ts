import type { Occupation } from "@azuki/shared";
import { content } from "../../../content";
import { formatOccupationSalary } from "../utils/formatOccupationSalary";

export function buildOccupationShareText(
	occupation: Occupation | null,
	occupationDuration: string,
): string {
	const parts: string[] = [];

	if (occupationDuration) {
		parts.push(
			`${content["results.detail.durationTitle"]}: ${occupationDuration}`,
		);
	}

	const salaryLabel =
		occupation?.salaryKnown && occupation.salaryMonthlyMedian !== null
			? formatOccupationSalary(occupation.salaryMonthlyMedian)
			: content["results.detail.salary.unknown"];

	parts.push(`${content["results.detail.salaryTitle"]}: ${salaryLabel}`);

	return parts.join(" · ");
}
