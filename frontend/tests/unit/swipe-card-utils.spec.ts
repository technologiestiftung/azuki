import { expect, test, describe } from "vitest";

import {
	SWIPE_THRESHOLD,
	FLY_OUT_MS,
	detectSwipeDirection,
	getCardVisualState,
	getCursorStyle,
	getDragDirectionAndProgress,
	getTopCardAccentBg,
	swipeFlyOutTopTransformTransition,
	swipeSnapBackStackLayerTransition,
	swipeSnapBackTopTransition,
	topCardAnimationClassNames,
} from "../../src/components/primitives/swipe-card-stack/swipe-card-utils";

describe("topCardAnimationClassNames", () => {
	test("returns slide-in class when phase is slide-in and direction is set", () => {
		expect(topCardAnimationClassNames("slide-in", "left")).toBe(
			"animate-slideInLeft",
		);
		expect(topCardAnimationClassNames("slide-in", "right")).toBe(
			"animate-slideInRight",
		);
		expect(topCardAnimationClassNames("slide-in", "up")).toBe(
			"animate-slideInTop",
		);
	});

	test("returns empty string for idle or when direction is null", () => {
		expect(topCardAnimationClassNames("idle", "left")).toBe("");
		expect(topCardAnimationClassNames("slide-in", null)).toBe("");
		expect(topCardAnimationClassNames("slide-out", "right")).toBe("");
	});
});

describe("getTopCardAccentBg", () => {
	const customAccent = { left: "bg-red-500", right: "bg-blue-500" };

	test("returns gray idle when fly or animation is up", () => {
		expect(
			getTopCardAccentBg({
				isDragging: true,
				dragX: 100,
				dragY: 0,
				flyDirection: "up",
				animationDirection: null,
			}),
		).toBe("bg-gray-200");

		expect(
			getTopCardAccentBg({
				isDragging: false,
				dragX: 0,
				dragY: 0,
				flyDirection: null,
				animationDirection: "up",
			}),
		).toBe("bg-gray-200");
	});

	test("returns gray when dominant up drag (skip gesture)", () => {
		expect(
			getTopCardAccentBg({
				isDragging: true,
				dragX: 10,
				dragY: -90,
				flyDirection: null,
				animationDirection: null,
			}),
		).toBe("bg-gray-200");
	});

	test("returns accent side for horizontal intent while dragging", () => {
		expect(
			getTopCardAccentBg({
				isDragging: true,
				dragX: 20,
				dragY: 0,
				flyDirection: null,
				animationDirection: null,
				accent: customAccent,
			}),
		).toBe("bg-blue-500");

		expect(
			getTopCardAccentBg({
				isDragging: true,
				dragX: -20,
				dragY: 0,
				flyDirection: null,
				animationDirection: null,
				accent: customAccent,
			}),
		).toBe("bg-red-500");
	});

	test("uses flyDirection or animationDirection when not overridden by up", () => {
		expect(
			getTopCardAccentBg({
				isDragging: false,
				dragX: 0,
				dragY: 0,
				flyDirection: "right",
				animationDirection: null,
				accent: customAccent,
			}),
		).toBe("bg-blue-500");

		expect(
			getTopCardAccentBg({
				isDragging: false,
				dragX: 0,
				dragY: 0,
				flyDirection: null,
				animationDirection: "left",
				accent: customAccent,
			}),
		).toBe("bg-red-500");
	});

	test("returns idle when no side is determined", () => {
		expect(
			getTopCardAccentBg({
				isDragging: false,
				dragX: 0,
				dragY: 0,
				flyDirection: null,
				animationDirection: null,
			}),
		).toBe("bg-gray-200");
	});
});

describe("swipeSnapBackTopTransition", () => {
	test("builds transform timing from duration", () => {
		expect(swipeSnapBackTopTransition(300)).toBe("transform 300ms ease");
	});
});

describe("swipeSnapBackStackLayerTransition", () => {
	test("combines top transform transition with opacity", () => {
		expect(swipeSnapBackStackLayerTransition(300)).toBe(
			"transform 300ms ease, opacity 300ms ease",
		);
	});
});

describe("swipeFlyOutTopTransformTransition", () => {
	test("uses FLY_OUT_MS", () => {
		expect(swipeFlyOutTopTransformTransition()).toBe(
			`transform ${FLY_OUT_MS}ms ease-in`,
		);
	});
});

describe("getCardVisualState", () => {
	test("computes back stack and ghost from drag progress", () => {
		const state = getCardVisualState(
			{ x: SWIPE_THRESHOLD, y: 0 },
			{
				isFlying: false,
				isActive: true,
				flyDirection: null,
				flyStart: null,
			},
		);

		expect(state.backScale).toBe(1);
		expect(state.backOpacity).toBe(1);
		expect(state.backTranslateY).toBe(0);
		expect(Math.abs(state.ghostTranslateY)).toBe(0);
		expect(state.topTransform).toContain("rotate(");
		expect(state.topTransform).toContain("scale(1)");
	});

	test("flying state pins progress at 1", () => {
		const state = getCardVisualState(
			{ x: 0, y: 0 },
			{
				isFlying: true,
				isActive: true,
				flyDirection: "right",
				flyStart: null,
			},
		);

		expect(state.backScale).toBe(1);
		expect(state.backOpacity).toBe(1);
	});

	test("up fly applies scale from flyUp progress when flyStart is set", () => {
		const state = getCardVisualState(
			{ x: 0, y: -400 },
			{
				isFlying: true,
				isActive: true,
				flyDirection: "up",
				flyStart: { x: 0, y: 0 },
			},
		);

		expect(state.topTransform).toMatch(/scale\([\d.]+/);
		expect(state.topTransform).toContain("rotate(0deg)");
	});

	test("inactive fly clears ghost offset", () => {
		const state = getCardVisualState(
			{ x: 40, y: 0 },
			{
				isFlying: false,
				isActive: false,
				flyDirection: null,
				flyStart: null,
			},
		);

		expect(state.ghostTranslateY).toBe(0);
	});
});

describe("getCursorStyle", () => {
	test("returns default when dragging disabled", () => {
		expect(getCursorStyle(false, false)).toBe("default");
		expect(getCursorStyle(false, true)).toBe("default");
	});

	test("returns grab or grabbing when enabled", () => {
		expect(getCursorStyle(true, false)).toBe("grab");
		expect(getCursorStyle(true, true)).toBe("grabbing");
	});
});

describe("getDragDirectionAndProgress", () => {
	test("derives direction and capped progress from drag", () => {
		expect(
			getDragDirectionAndProgress(true, SWIPE_THRESHOLD * 2, null),
		).toEqual({ direction: "right", progress: 1 });

		expect(getDragDirectionAndProgress(true, -40, null)).toEqual({
			direction: "left",
			progress: 40 / SWIPE_THRESHOLD,
		});
	});

	test("uses fly direction at full progress when not dragging", () => {
		expect(getDragDirectionAndProgress(false, 0, "left")).toEqual({
			direction: "left",
			progress: 1,
		});
	});

	test("ignores up for horizontal direction", () => {
		expect(getDragDirectionAndProgress(false, 0, "up")).toEqual({
			direction: null,
			progress: 0,
		});
	});

	test("no direction when not dragging and no lateral fly", () => {
		expect(getDragDirectionAndProgress(false, 0, null)).toEqual({
			direction: null,
			progress: 0,
		});
	});
});

describe("detectSwipeDirection", () => {
	test("detects up when vertical dominates past threshold", () => {
		expect(detectSwipeDirection(10, -90)).toBe("up");
	});

	test("detects horizontal when past threshold", () => {
		expect(detectSwipeDirection(90, 0)).toBe("right");
		expect(detectSwipeDirection(-90, 0)).toBe("left");
	});

	test("returns null below thresholds", () => {
		expect(detectSwipeDirection(40, -40)).toBe(null);
		expect(detectSwipeDirection(0, 0)).toBe(null);
	});
});
