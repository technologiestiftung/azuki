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
