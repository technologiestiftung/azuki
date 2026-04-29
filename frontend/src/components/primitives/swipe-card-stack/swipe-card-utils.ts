export type SwipeDirection = "left" | "right" | "up";

export type AnimationPhase = "idle" | "slide-in" | "slide-out";

export const SWIPE_THRESHOLD = 80;

export const DEFAULT_STACK_GHOST_LAYER_SCALE = 0.85;

const GRAVITY_OUT_GAIN = 1.16;
const GRAVITY_IN_GAIN = 0.84;

/**
 * Maps raw horizontal pointer delta so drags started on the left half feel easier
 * to pull left (and symmetrically for the right half).
 */
export function applyHorizontalDragGravity(
	rawDx: number,
	startedLeftHalf: boolean,
): number {
	if (startedLeftHalf) {
		return rawDx <= 0 ? rawDx * GRAVITY_OUT_GAIN : rawDx * GRAVITY_IN_GAIN;
	}
	return rawDx >= 0 ? rawDx * GRAVITY_OUT_GAIN : rawDx * GRAVITY_IN_GAIN;
}
export const FLY_OUT_MS = 600;

/** Below-threshold release: top card eases back to the stack origin */
export const SWIPE_SNAP_BACK_MS = 300;

/** Pointer cancel: same motion with a slightly longer ease */
export const SWIPE_SNAP_BACK_POINTER_CANCEL_MS = 500;
export const SLIDE_IN_MS = 800;
export const EXIT_OFFSET_X = 1000;
export const EXIT_OFFSET_Y = -800;

const SLIDE_IN_ANIMATION: Record<SwipeDirection, string> = {
	left: "animate-slideInLeft",
	right: "animate-slideInRight",
	up: "animate-slideInTop",
};

/** Tailwind `gray-300` / `gray-200` — back card surface lerps between these as it scales up. */
const BACK_CARD_SURFACE_FROM = [0xd1, 0xd5, 0xdb] as const;
const BACK_CARD_SURFACE_TO = [0xe5, 0xe7, 0xeb] as const;

export function mixBackCardSurfaceColor(progress: number): string {
	const t = Math.min(1, Math.max(0, progress));
	const r = Math.round(
		BACK_CARD_SURFACE_FROM[0] +
			(BACK_CARD_SURFACE_TO[0] - BACK_CARD_SURFACE_FROM[0]) * t,
	);
	const g = Math.round(
		BACK_CARD_SURFACE_FROM[1] +
			(BACK_CARD_SURFACE_TO[1] - BACK_CARD_SURFACE_FROM[1]) * t,
	);
	const b = Math.round(
		BACK_CARD_SURFACE_FROM[2] +
			(BACK_CARD_SURFACE_TO[2] - BACK_CARD_SURFACE_FROM[2]) * t,
	);
	return `rgb(${r} ${g} ${b})`;
}

export interface CardVisualState {
	backScale: number;
	backTranslateY: number;
	backCardBackgroundColor: string;
	ghostOpacity: number;
	topTransform: string;
}

export function topCardAnimationClassNames(
	phase: AnimationPhase,
	direction: SwipeDirection | null,
): string {
	if (phase === "slide-in" && direction) {
		return SLIDE_IN_ANIMATION[direction];
	}
	return "";
}

export interface TopCardHorizontalAccentBg {
	left: string;
	right: string;
}

const DEFAULT_ACCENT: TopCardHorizontalAccentBg = {
	left: "bg-sky-300",
	right: "bg-sky-300",
};

const IDLE_BG = "bg-gray-200";

/** Horizontal drag past this (px) tints even when vertical movement is larger. */
const TINT_OVERRIDE_HORIZONTAL_DRAG_PX = 18;

/** Minimum horizontal movement (px) before tint when horizontal already dominates vertical. */
const TINT_DOMINANT_HORIZONTAL_DRAG_PX = 6;

/** Matches `detectSwipeDirection` "up" so vertical skip drags stay neutral. */
function isDominantUpDrag(dragX: number, dragY: number): boolean {
	const absDx = Math.abs(dragX);
	const absDy = Math.abs(dragY);
	return dragY < -SWIPE_THRESHOLD && absDy > absDx;
}

export interface TopCardAccentBgInput {
	isDragging: boolean;
	dragX: number;
	dragY: number;
	flyDirection: SwipeDirection | null;
	animationDirection: SwipeDirection | null;
	accent?: TopCardHorizontalAccentBg;
}

/**
 * Returns the Tailwind bg class for the top card.
 *
 * - Idle / up-swipe → `bg-gray-200`
 * - Horizontal drag past a small threshold → `accent.left` or `accent.right`
 *
 * When `accent` is passed explicitly (asymmetric left/right stacks), the base stays
 * `bg-gray-200` so progressive tint can live only in the card overlay — avoids an
 * instant jump to full saturation while dragging.
 */
export function getTopCardAccentBg(input: TopCardAccentBgInput): string {
	const { isDragging, dragX, dragY, flyDirection, animationDirection } = input;
	const accent = input.accent ?? DEFAULT_ACCENT;
	const useOverlayOnlyTint = input.accent !== undefined;

	if (useOverlayOnlyTint) {
		return IDLE_BG;
	}

	if (flyDirection === "up" || animationDirection === "up") {
		return IDLE_BG;
	}
	if (isDragging && isDominantUpDrag(dragX, dragY)) {
		return IDLE_BG;
	}

	let dragSide: SwipeDirection | null = null;
	if (isDragging) {
		const horizontalIntent =
			Math.abs(dragX) > TINT_OVERRIDE_HORIZONTAL_DRAG_PX ||
			(Math.abs(dragX) >= TINT_DOMINANT_HORIZONTAL_DRAG_PX &&
				Math.abs(dragX) >= Math.abs(dragY));
		if (horizontalIntent) {
			if (dragX > 0) {
				dragSide = "right";
			} else if (dragX < 0) {
				dragSide = "left";
			}
		}
	}
	const side = flyDirection ?? animationDirection ?? dragSide;

	if (side === null) {
		return IDLE_BG;
	}
	return side === "right" ? accent.right : accent.left;
}

export function swipeSnapBackTopTransition(durationMs: number): string {
	return `transform ${durationMs}ms ease`;
}

/**
 * Back stack card during snap-back: same `transform` timing as the top card,
 * plus `background-color`, using the same millisecond value (no string parsing).
 */
export function swipeSnapBackStackLayerTransition(durationMs: number): string {
	const top = swipeSnapBackTopTransition(durationMs);
	return `${top}, background-color ${durationMs}ms ease`;
}

export function swipeFlyOutTopTransformTransition(): string {
	return `transform ${FLY_OUT_MS}ms ease-in`;
}

/** 0 → 1 as current Y moves from startY toward EXIT_OFFSET_Y */
function flyUpProgress(startY: number, currentY: number): number {
	const denom = EXIT_OFFSET_Y - startY;
	if (Math.abs(denom) < 1e-6) {
		return 1;
	}
	return Math.min(1, Math.max(0, (currentY - startY) / denom));
}

export interface GetCardVisualStateFly {
	isFlying: boolean;
	isActive: boolean;
	flyDirection: SwipeDirection | null;
	flyStart: { x: number; y: number } | null;
}

export function getCardVisualState(
	activeOffset: { x: number; y: number },
	fly: GetCardVisualStateFly,
	ghostLayerScale: number = DEFAULT_STACK_GHOST_LAYER_SCALE,
): CardVisualState {
	const { isFlying, flyDirection, flyStart } = fly;
	const absX = Math.abs(activeOffset.x);
	const absUpY = Math.max(0, -activeOffset.y);
	const progress = isFlying
		? 1
		: Math.min(Math.max(absX, absUpY) / SWIPE_THRESHOLD, 1);
	const backScale = ghostLayerScale + (1 - ghostLayerScale) * progress;
	const backTranslateY = 41 * (1 - progress);
	const ghostOpacity = fly.isActive ? progress : 1;

	const isFlyingUp = flyDirection === "up" && isFlying;
	const rotate = isFlyingUp ? 0 : activeOffset.x / 20;
	let flyUpT = 0;
	if (isFlyingUp && flyStart !== null) {
		flyUpT = flyUpProgress(flyStart.y, activeOffset.y);
	} else if (isFlyingUp) {
		flyUpT = 1;
	}
	const topScale = isFlyingUp ? 1 - 0.7 * flyUpT : 1;
	const topTransform = `translate(${activeOffset.x}px, ${activeOffset.y}px) rotate(${rotate}deg) scale(${topScale})`;

	return {
		backScale,
		backTranslateY,
		backCardBackgroundColor: mixBackCardSurfaceColor(progress),
		ghostOpacity,
		topTransform,
	};
}

export function getCursorStyle(
	isDraggingEnabled: boolean,
	isDragging: boolean,
): "default" | "grab" | "grabbing" {
	if (!isDraggingEnabled) {
		return "default";
	}

	return isDragging ? "grabbing" : "grab";
}

export interface DragDirectionAndProgress {
	direction: "left" | "right" | null;
	progress: number;
}

export interface DragTintContext {
	animationPhase: AnimationPhase;
	animationDirection: SwipeDirection | null;
}

export interface GetDragDirectionAndProgressInput {
	isDragging: boolean;
	dragX: number;
	flyDirection: SwipeDirection | null;
	tintContext?: DragTintContext;
}

export function getDragDirectionAndProgress(
	input: GetDragDirectionAndProgressInput,
): DragDirectionAndProgress {
	const { isDragging, dragX, flyDirection, tintContext } = input;
	if (isDragging && dragX !== 0) {
		return {
			direction: dragX > 0 ? "right" : "left",
			progress: Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1),
		};
	}
	if (flyDirection === "left" || flyDirection === "right") {
		return { direction: flyDirection, progress: 1 };
	}
	if (
		tintContext &&
		tintContext.animationPhase === "slide-in" &&
		(tintContext.animationDirection === "left" ||
			tintContext.animationDirection === "right")
	) {
		return {
			direction: tintContext.animationDirection,
			progress: 1,
		};
	}
	return { direction: null, progress: 0 };
}

export function detectSwipeDirection(
	directionX: number,
	directionY: number,
): SwipeDirection | null {
	const absDx = Math.abs(directionX);
	const absDy = Math.abs(directionY);

	if (directionY < -SWIPE_THRESHOLD && absDy > absDx) {
		return "up";
	}
	if (directionX > SWIPE_THRESHOLD) {
		return "right";
	}
	if (directionX < -SWIPE_THRESHOLD) {
		return "left";
	}
	return null;
}

/** Release detection when the card only commits left/right drags (no vertical swipe). */
export function detectHorizontalSwipeOnly(
	directionX: number,
): SwipeDirection | null {
	if (directionX > SWIPE_THRESHOLD) {
		return "right";
	}
	if (directionX < -SWIPE_THRESHOLD) {
		return "left";
	}
	return null;
}

/** Horizontal release takes priority; optional upward skip when enabled. */
export function resolvePointerReleaseSwipeDirection(
	directionX: number,
	directionY: number,
	isSwipeUpGestureEnabled: boolean,
): SwipeDirection | null {
	const lateral = detectHorizontalSwipeOnly(directionX);
	if (lateral !== null) {
		return lateral;
	}
	if (
		isSwipeUpGestureEnabled &&
		detectSwipeDirection(directionX, directionY) === "up"
	) {
		return "up";
	}
	return null;
}
