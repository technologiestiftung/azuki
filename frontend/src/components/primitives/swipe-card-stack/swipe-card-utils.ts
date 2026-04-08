export type SwipeDirection = "left" | "right" | "up";

export type AnimationPhase = "idle" | "slide-in" | "slide-out";

export const SWIPE_THRESHOLD = 80;
export const FLY_OUT_MS = 600;
export const SLIDE_IN_MS = 400;
export const EXIT_OFFSET_X = 1000;
export const EXIT_OFFSET_Y = -800;

const SLIDE_IN_ANIMATION: Record<SwipeDirection, string> = {
	left: "animate-slideInLeft",
	right: "animate-slideInRight",
	up: "animate-slideInTop",
};

const SLIDE_OUT_ANIMATION: Record<SwipeDirection, string> = {
	left: "animate-slideOutLeft",
	right: "animate-slideOutRight",
	up: "animate-slideOutUp",
};

export interface CardVisualState {
	progress: number;
	backScale: number;
	backOpacity: number;
	backTranslateY: number;
	topOpacity: number;
	topTransform: string;
}

export function topCardAnimationClassNames(
	phase: AnimationPhase,
	direction: SwipeDirection | null,
): string {
	if (phase === "slide-in" && direction) {
		return SLIDE_IN_ANIMATION[direction];
	}
	if (phase === "slide-out" && direction) {
		return SLIDE_OUT_ANIMATION[direction];
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
 * - Horizontal swipe or drag → `accent.left` or `accent.right`
 */
export function getTopCardAccentBg(input: TopCardAccentBgInput): string {
	const { isDragging, dragX, dragY, flyDirection, animationDirection } = input;
	const accent = input.accent ?? DEFAULT_ACCENT;

	if (flyDirection === "up" || animationDirection === "up") {
		return IDLE_BG;
	}
	if (isDragging && isDominantUpDrag(dragX, dragY)) {
		return IDLE_BG;
	}

	let dragSide: SwipeDirection | null = null;
	if (isDragging) {
		dragSide = dragX >= 0 ? "right" : "left";
	}
	const side = flyDirection ?? animationDirection ?? dragSide;

	if (side === null) {
		return IDLE_BG;
	}
	return side === "right" ? accent.right : accent.left;
}

export function getCardVisualState(
	activeOffset: { x: number; y: number },
	isFlying: boolean,
	flyDirection: SwipeDirection | null,
): CardVisualState {
	const absX = Math.abs(activeOffset.x);
	const absUpY = Math.max(0, -activeOffset.y);
	const progress = isFlying
		? 1
		: Math.min(Math.max(absX, absUpY) / SWIPE_THRESHOLD, 1);
	const backScale = 0.85 + 0.15 * progress;
	const backOpacity = progress;
	const backTranslateY = 35 * (1 - progress);

	const isFlyingUp = flyDirection === "up" && isFlying;
	const rotate = isFlyingUp ? 0 : activeOffset.x / 20;
	const topScale = isFlyingUp ? 0.3 : 1;
	const topOpacity = isFlyingUp ? 0 : 1;
	const topTransform = `translate(${activeOffset.x}px, ${activeOffset.y}px) rotate(${rotate}deg) scale(${topScale})`;

	return {
		progress,
		backScale,
		backOpacity,
		backTranslateY,
		topOpacity,
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
