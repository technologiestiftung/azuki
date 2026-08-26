import { expect, test, describe } from "vitest";

import {
	SWIPE_THRESHOLD,
	DEFAULT_STACK_GHOST_LAYER_SCALE,
	FLY_OUT_MS,
	applyHorizontalDragGravity,
	detectHorizontalSwipeOnly,
	detectSwipeDirection,
	getCardVisualState,
	computeGhostStackScale,
	getCursorStyle,
	getDragDirectionAndProgress,
	getTopCardAccentBg,
	mixBackCardSurfaceColor,
	resolvePointerReleaseSwipeDirection,
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
		).toBe("bg-sky-shade-20");

		expect(
			getTopCardAccentBg({
				isDragging: false,
				dragX: 0,
				dragY: 0,
				flyDirection: null,
				animationDirection: "up",
			}),
		).toBe("bg-sky-shade-20");
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
		).toBe("bg-sky-shade-20");
	});

	test("keeps neutral base when accent is explicit (tint is overlay-only)", () => {
		expect(
			getTopCardAccentBg({
				isDragging: true,
				dragX: 20,
				dragY: 0,
				flyDirection: null,
				animationDirection: null,
				accent: customAccent,
			}),
		).toBe("bg-sky-shade-20");

		expect(
			getTopCardAccentBg({
				isDragging: true,
				dragX: -20,
				dragY: 0,
				flyDirection: null,
				animationDirection: null,
				accent: customAccent,
			}),
		).toBe("bg-sky-shade-20");
	});

	test("uses flyDirection or animationDirection when accent uses defaults only", () => {
		expect(
			getTopCardAccentBg({
				isDragging: false,
				dragX: 0,
				dragY: 0,
				flyDirection: "right",
				animationDirection: null,
			}),
		).toBe("bg-sky-300");

		expect(
			getTopCardAccentBg({
				isDragging: false,
				dragX: 0,
				dragY: 0,
				flyDirection: null,
				animationDirection: "left",
			}),
		).toBe("bg-sky-300");
	});

	test("keeps neutral base for explicit accent during fly / slide animation", () => {
		expect(
			getTopCardAccentBg({
				isDragging: false,
				dragX: 0,
				dragY: 0,
				flyDirection: "right",
				animationDirection: null,
				accent: customAccent,
			}),
		).toBe("bg-sky-shade-20");

		expect(
			getTopCardAccentBg({
				isDragging: false,
				dragX: 0,
				dragY: 0,
				flyDirection: null,
				animationDirection: "left",
				accent: customAccent,
			}),
		).toBe("bg-sky-shade-20");
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
		).toBe("bg-sky-shade-20");
	});
});

describe("swipeSnapBackTopTransition", () => {
	test("builds transform timing from duration", () => {
		expect(swipeSnapBackTopTransition(300)).toBe("transform 300ms ease");
	});
});

describe("swipeSnapBackStackLayerTransition", () => {
	test("combines top transform transition with background-color", () => {
		expect(swipeSnapBackStackLayerTransition(300)).toBe(
			"transform 300ms ease, background-color 300ms ease",
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

describe("mixBackCardSurfaceColor", () => {
	test("interpolates from gray-300 at 0 to sky-shade-20 at 1", () => {
		expect(mixBackCardSurfaceColor(0)).toBe("rgb(209 213 219)");
		expect(mixBackCardSurfaceColor(1)).toBe("rgb(229 231 235)");
	});
});

describe("computeGhostStackScale", () => {
	test("matches base scale at rest and at full progress; dips near mid progress", () => {
		const g = DEFAULT_STACK_GHOST_LAYER_SCALE;
		expect(computeGhostStackScale(g, 0)).toBeCloseTo(g);
		expect(computeGhostStackScale(g, 1)).toBeCloseTo(g);
		expect(computeGhostStackScale(g, 0.5)).toBeLessThan(g);
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
		expect(state.backTranslateY).toBe(0);
		expect(state.backCardBackgroundColor).toBe(mixBackCardSurfaceColor(1));
		expect(state.ghostOpacity).toBe(1);
		expect(state.interactionProgress).toBe(1);
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
		expect(state.ghostOpacity).toBe(1);
		expect(state.interactionProgress).toBe(1);
	});

	test("ghost is hidden at gesture start and fades with progress when active", () => {
		const hidden = getCardVisualState(
			{ x: 0, y: 0 },
			{
				isFlying: false,
				isActive: true,
				flyDirection: null,
				flyStart: null,
			},
		);
		expect(hidden.ghostOpacity).toBe(0);
		expect(hidden.backScale).toBe(DEFAULT_STACK_GHOST_LAYER_SCALE);
		expect(hidden.interactionProgress).toBe(0);

		const mid = getCardVisualState(
			{ x: SWIPE_THRESHOLD / 2, y: 0 },
			{
				isFlying: false,
				isActive: true,
				flyDirection: null,
				flyStart: null,
			},
		);
		expect(mid.ghostOpacity).toBeCloseTo(0.5);
		expect(mid.interactionProgress).toBeCloseTo(0.5);
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

	test("when stack layer is inactive, ghost stays fully visible", () => {
		const state = getCardVisualState(
			{ x: 40, y: 0 },
			{
				isFlying: false,
				isActive: false,
				flyDirection: null,
				flyStart: null,
			},
		);

		expect(state.ghostOpacity).toBe(1);
		expect(state.interactionProgress).toBeCloseTo(40 / SWIPE_THRESHOLD);
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
			getDragDirectionAndProgress({
				isDragging: true,
				dragX: SWIPE_THRESHOLD * 2,
				flyDirection: null,
			}),
		).toEqual({ direction: "right", progress: 1 });

		expect(
			getDragDirectionAndProgress({
				isDragging: true,
				dragX: -40,
				flyDirection: null,
			}),
		).toEqual({
			direction: "left",
			progress: 40 / SWIPE_THRESHOLD,
		});
	});

	test("uses fly direction at full progress when not dragging", () => {
		expect(
			getDragDirectionAndProgress({
				isDragging: false,
				dragX: 0,
				flyDirection: "left",
			}),
		).toEqual({
			direction: "left",
			progress: 1,
		});
	});

	test("slide-in horizontal uses animation direction at full progress", () => {
		expect(
			getDragDirectionAndProgress({
				isDragging: false,
				dragX: 0,
				flyDirection: null,
				tintContext: {
					animationPhase: "slide-in",
					animationDirection: "right",
				},
			}),
		).toEqual({ direction: "right", progress: 1 });
	});

	test("ignores up for horizontal direction", () => {
		expect(
			getDragDirectionAndProgress({
				isDragging: false,
				dragX: 0,
				flyDirection: "up",
			}),
		).toEqual({
			direction: null,
			progress: 0,
		});
	});

	test("no direction when not dragging and no lateral fly", () => {
		expect(
			getDragDirectionAndProgress({
				isDragging: false,
				dragX: 0,
				flyDirection: null,
			}),
		).toEqual({
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

describe("applyHorizontalDragGravity", () => {
	test("left-half start amplifies leftward drag and dampens rightward", () => {
		expect(applyHorizontalDragGravity(-100, true)).toBeCloseTo(-116);
		expect(applyHorizontalDragGravity(100, true)).toBeCloseTo(84);
	});

	test("right-half start amplifies rightward drag and dampens leftward", () => {
		expect(applyHorizontalDragGravity(100, false)).toBeCloseTo(116);
		expect(applyHorizontalDragGravity(-100, false)).toBeCloseTo(-84);
	});
});

describe("detectHorizontalSwipeOnly", () => {
	test("detects horizontal past threshold", () => {
		expect(detectHorizontalSwipeOnly(SWIPE_THRESHOLD + 1)).toBe("right");
		expect(detectHorizontalSwipeOnly(-SWIPE_THRESHOLD - 1)).toBe("left");
	});

	test("returns null below threshold regardless of vertical", () => {
		expect(detectHorizontalSwipeOnly(40)).toBe(null);
		expect(detectHorizontalSwipeOnly(10)).toBe(null);
	});
});

describe("resolvePointerReleaseSwipeDirection", () => {
	test("prefers lateral over vertical when both qualify", () => {
		expect(
			resolvePointerReleaseSwipeDirection(SWIPE_THRESHOLD + 5, -200, true),
		).toBe("right");
	});

	test("allows up only when enabled and lateral is below threshold", () => {
		expect(resolvePointerReleaseSwipeDirection(10, -90, true)).toBe("up");
		expect(resolvePointerReleaseSwipeDirection(10, -90, false)).toBe(null);
	});
});
