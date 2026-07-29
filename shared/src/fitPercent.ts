const CURVE_STEEPNESS = 0.105;
const CURVE_MIDPOINT = 13;

export function fitPercent(rawScore: number): number {
	const logistic =
		100 / (1 + Math.exp(-CURVE_STEEPNESS * (rawScore - CURVE_MIDPOINT)));
	return Math.round(Math.min(100, Math.max(0, logistic)));
}

/** Approximate inverse of {@link fitPercent} for reconstructing shared match scores. */
export function scoreFromFitPercent(displayPercent: number): number {
	const clamped = Math.min(100, Math.max(0, displayPercent));
	if (clamped <= 0) {
		return -60;
	}
	if (clamped >= 100) {
		return 80;
	}
	const ratio = 100 / clamped - 1;
	return CURVE_MIDPOINT - Math.log(ratio) / CURVE_STEEPNESS;
}
