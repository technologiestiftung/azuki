import type { Occupation } from "@azuki/shared";

// We precompute dataset-relative salary bands once so each occupation can be
// scored against "good_salary" thresholds without recalculating percentiles.
export interface SalaryBands {
	lowerBandMin: number;
	upperBandMin: number;
}

function percentile(sortedValues: number[], p: number): number {
	if (sortedValues.length === 0) return 0;
	const idx = Math.floor((sortedValues.length - 1) * p);
	return sortedValues[idx];
}

export function buildSalaryBands(
	occupations: Occupation[],
): SalaryBands | null {
	const salaryValues = occupations
		.filter((o): o is Occupation & { salaryMonthlyMedian: number } =>
			o.salaryKnown && o.salaryMonthlyMedian !== null,
		)
		.map((o) => o.salaryMonthlyMedian)
		.sort((a, b) => a - b);

	if (salaryValues.length === 0) {
		return null;
	}

	return {
		lowerBandMin: percentile(salaryValues, 0.33),
		upperBandMin: percentile(salaryValues, 0.66),
	};
}
