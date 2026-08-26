const CURVE_STEEPNESS = 0.105;
const CURVE_MIDPOINT = 13;

/** Cards that may share a number inside a pooled run before it steps down. */
const REPEATS_PER_STEP = 2;

function logistic(rawScore: number): number {
	return 100 / (1 + Math.exp(-CURVE_STEEPNESS * (rawScore - CURVE_MIDPOINT)));
}

export function fitPercent(rawScore: number): number {
	return Math.round(Math.min(100, Math.max(0, logistic(rawScore))));
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

/** Merges every run that rises into a single block holding the run's mean. */
function poolAdjacentViolators(
	values: number[],
): { sum: number; count: number }[] {
	const blocks: { sum: number; count: number }[] = [];

	for (const value of values) {
		blocks.push({ sum: value, count: 1 });
		while (blocks.length > 1) {
			const current = blocks[blocks.length - 1];
			const previous = blocks[blocks.length - 2];
			if (previous.sum / previous.count >= current.sum / current.count) {
				break;
			}
			blocks.pop();
			previous.sum += current.sum;
			previous.count += current.count;
		}
	}
	return blocks;
}

/**
 * Percentages for a whole result list, in display order.
 *
 * The AI orders the cards but returns no number of its own, so a card lower
 * down can outscore the one above it. Only runs that actually violate the order
 * are pooled; every other card keeps its exact value, repeats included. A
 * pooled run steps down a point per REPEATS_PER_STEP cards so that it cannot
 * collapse into a single number.
 */
export function fitPercentages(scoresInDisplayOrder: number[]): number[] {
	const percentages: number[] = [];
	let ceiling = 100;

	for (const block of poolAdjacentViolators(
		scoresInDisplayOrder.map(logistic),
	)) {
		const pooled = block.sum / block.count;
		for (let i = 0; i < block.count; i++) {
			const stepped = pooled - Math.floor(i / REPEATS_PER_STEP);
			const display = Math.max(0, Math.round(Math.min(stepped, ceiling)));
			percentages.push(display);
			ceiling = display;
		}
	}
	return percentages;
}

/**
 * The number a card shows: the value stamped across the list, or the
 * single-card curve for lists that never went through {@link fitPercentages}.
 */
export function displayFitPercent(occupation: {
	fitPercent?: number;
	score: number;
}): number {
	return occupation.fitPercent ?? fitPercent(occupation.score);
}
