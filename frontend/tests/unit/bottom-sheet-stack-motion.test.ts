import { describe, expect, test } from "vitest";
import {
	STACK_PEEK_GAP_PX,
	STACKED_BEHIND_SCALE,
	computeStackedBehindTranslateY,
} from "../../src/components/primitives/bottom-sheet/useBottomSheetStackMotion";

describe("computeStackedBehindTranslateY", () => {
	test("returns 0 when either height is missing", () => {
		expect(computeStackedBehindTranslateY(0, 200)).toBe(0);
		expect(computeStackedBehindTranslateY(400, 0)).toBe(0);
	});

	test("positions scaled behind top STACK_PEEK_GAP_PX above front top", () => {
		const behindShellHeight = 500;
		const stackFrontHeight = 280;
		const translateY = computeStackedBehindTranslateY(
			behindShellHeight,
			stackFrontHeight,
		);

		// Matches `scale(s) translateY(y)` with transform-origin bottom center.
		const behindTopFromBottom =
			behindShellHeight * STACKED_BEHIND_SCALE - translateY;
		const frontTopFromBottom = stackFrontHeight;

		expect(behindTopFromBottom - frontTopFromBottom).toBe(STACK_PEEK_GAP_PX);
	});

	test("uses positive translate when behind sheet is taller than front", () => {
		expect(computeStackedBehindTranslateY(500, 280)).toBeGreaterThan(0);
	});
});
