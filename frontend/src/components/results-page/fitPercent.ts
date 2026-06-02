const CURVE_STEEPNESS = 0.105;
const CURVE_MIDPOINT = 9;

export function fitPercent(rawScore: number): number {
	const logistic =
		100 / (1 + Math.exp(-CURVE_STEEPNESS * (rawScore - CURVE_MIDPOINT)));
	return Math.round(Math.min(100, Math.max(0, logistic)));
}
