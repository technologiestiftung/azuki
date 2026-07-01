/** Matches StrengthsSlider / StrengthsEditor: 0 = nicht, 0.5 = etwas, 1 = stark. */
export function strengthScorePoints(value: number): number {
	if (value >= 1) {
		return 2;
	}
	if (value >= 0.5) {
		return 1;
	}
	return 0;
}
