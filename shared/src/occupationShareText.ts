import { formatOccupationSalary } from "./formatOccupationSalary.js";
import { resolveOccupationDuration } from "./occupationDuration.js";
import type { Occupation } from "./types.js";

const DURATION_LABEL = "Dauer";
const SALARY_LABEL = "Einstiegsgehalt";
const UNKNOWN_SALARY_LABEL = "Unbekannt";

export function buildOccupationShareText(
	occupation: Occupation | null | undefined,
	occupationDuration?: string,
): string {
	const duration =
		occupationDuration ?? resolveOccupationDuration(occupation ?? null);
	const parts: string[] = [];

	if (duration) {
		parts.push(`${DURATION_LABEL}: ${duration}`);
	}

	const salaryLabel =
		occupation?.salaryEntryKnown && occupation.salaryMonthlyEntry !== null
			? formatOccupationSalary(occupation.salaryMonthlyEntry)
			: UNKNOWN_SALARY_LABEL;

	parts.push(`${SALARY_LABEL}: ${salaryLabel}`);

	return parts.join(" · ");
}
