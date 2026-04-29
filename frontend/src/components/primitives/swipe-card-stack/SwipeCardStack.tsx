import React, {
	useState,
	useRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	forwardRef,
} from "react";

import {
	applyHorizontalDragGravity,
	resolvePointerReleaseSwipeDirection,
	FLY_OUT_MS,
	EXIT_OFFSET_X,
	EXIT_OFFSET_Y,
	getDragDirectionAndProgress,
	getCardVisualState,
	DEFAULT_STACK_GHOST_LAYER_SCALE,
	getCursorStyle,
	getTopCardAccentBg,
	SLIDE_IN_MS,
	SWIPE_SNAP_BACK_MS,
	SWIPE_SNAP_BACK_POINTER_CANCEL_MS,
	swipeFlyOutTopTransformTransition,
	swipeSnapBackStackLayerTransition,
	swipeSnapBackTopTransition,
	topCardAnimationClassNames,
} from "./swipe-card-utils";
import type {
	AnimationPhase,
	SwipeDirection,
	TopCardHorizontalAccentBg,
} from "./swipe-card-utils";

export type { SwipeDirection };

export interface SwipeCardRenderArgs {
	index: number;
	dragDirection: "left" | "right" | null;
	dragProgress: number;
	slideInHorizontalColorFade?: boolean;
}

export interface SwipeCardStackHandle {
	goNext: () => void;
	goBack: () => void;
	swipeLeft: () => void;
	swipeRight: () => void;
	swipeUp: () => void;
}

interface SwipeCardStackProps {
	count: number;
	initialIndex?: number;
	isDraggingEnabled?: boolean;
	isSwipeUpGestureEnabled?: boolean;
	onCommit: (index: number) => SwipeDirection;
	onExhausted: () => void;
	onBefore: () => void;
	onBack: (newIndex: number) => SwipeDirection;
	onIndexChange?: (index: number) => void;
	onSwipe?: (direction: SwipeDirection, index: number) => void;
	renderCard: (args: SwipeCardRenderArgs) => React.ReactNode;
	renderBackCard?: (args: SwipeCardRenderArgs) => React.ReactNode;
	className?: string;
	horizontalAccentBg?: TopCardHorizontalAccentBg;
	stackGhostLayerScale?: number;
}

function getTopCardContentOpacity(input: {
	horizontalAccentBg: TopCardHorizontalAccentBg | undefined;
	isDragging: boolean;
	dragDirection: "left" | "right" | null;
	dragProgress: number;
}): number {
	const { horizontalAccentBg, isDragging, dragDirection, dragProgress } = input;
	if (horizontalAccentBg === undefined && isDragging && dragDirection) {
		return 1 - dragProgress * 0.15;
	}
	return 1;
}

function backCardLayerStyle(input: {
	slideInRecede: boolean;
	stackGhostLayerScale: number;
	backCardBackgroundColor: string;
	backScale: number;
	backTranslateY: number;
	backCardTransition: string;
}): React.CSSProperties {
	const {
		slideInRecede,
		stackGhostLayerScale,
		backCardBackgroundColor,
		backScale,
		backTranslateY,
		backCardTransition,
	} = input;
	if (slideInRecede) {
		return {
			["--stack-ghost-scale" as string]: String(stackGhostLayerScale),
			willChange: "transform, background-color",
		};
	}
	return {
		backgroundColor: backCardBackgroundColor,
		transform: `scale(${backScale}) translateY(${backTranslateY}px)`,
		transition: backCardTransition,
		willChange: "transform, background-color",
	};
}

function slideInHorizontalColorFadeActive(
	horizontalAccentBg: TopCardHorizontalAccentBg | undefined,
	isSliding: boolean,
	animationDirection: SwipeDirection | null,
): boolean {
	return (
		horizontalAccentBg !== undefined &&
		isSliding &&
		(animationDirection === "left" || animationDirection === "right")
	);
}

export const SwipeCardStack = forwardRef<
	SwipeCardStackHandle,
	SwipeCardStackProps
>(function SwipeCardStack(
	{
		count,
		initialIndex = 0,
		isDraggingEnabled = true,
		isSwipeUpGestureEnabled = true,
		onCommit,
		onExhausted,
		onBefore,
		onBack,
		onIndexChange,
		onSwipe,
		renderCard,
		renderBackCard,
		className = "",
		horizontalAccentBg,
		stackGhostLayerScale = DEFAULT_STACK_GHOST_LAYER_SCALE,
	},
	ref,
) {
	const [displayIndex, setDisplayIndex] = useState(initialIndex);
	const [isDragging, setIsDragging] = useState(false);

	useEffect(() => {
		setDisplayIndex(initialIndex);
	}, [initialIndex]);
	const [dragX, setDragX] = useState(0);
	const [dragY, setDragY] = useState(0);
	const [cardTransition, setCardTransition] = useState("");
	const [flyOffset, setFlyOffset] = useState<{ x: number; y: number } | null>(
		null,
	);
	const [animationPhase, setAnimationPhase] = useState<AnimationPhase>("idle");
	const [animationDirection, setAnimationDirection] =
		useState<SwipeDirection | null>(null);
	const [flyDirection, setFlyDirection] = useState<SwipeDirection | null>(null);
	const [flyStartOffset, setFlyStartOffset] = useState<{
		x: number;
		y: number;
	} | null>(null);
	const [backCardTransition, setBackCardTransition] = useState("none");

	const pointerStartX = useRef<number | null>(null);
	const pointerStartY = useRef<number | null>(null);
	const dragStartedLeftHalfRef = useRef(true);
	const isAnimating = useRef(false);
	const timeoutRef = useRef<number | null>(null);
	const pendingSlideInDirectionRef = useRef<SwipeDirection | null>(null);

	const isFlying = flyOffset !== null;
	const isSliding = animationPhase === "slide-in";
	const isSlidingOut = animationPhase === "slide-out";
	const hasNext = displayIndex < count - 1;
	const nextIndex = hasNext ? displayIndex + 1 : null;
	const activeOffset = flyOffset ?? { x: dragX, y: 0 };

	const {
		backScale,
		backTranslateY,
		backCardBackgroundColor,
		ghostOpacity,
		topTransform,
	} = getCardVisualState(
		activeOffset,
		{
			isFlying,
			isActive: isDragging || isFlying,
			flyDirection,
			flyStart: flyStartOffset,
		},
		stackGhostLayerScale,
	);

	useEffect(() => {
		setIsDragging(false);
		setDragX(0);
		setDragY(0);
		setFlyOffset(null);
		setFlyDirection(null);
		setFlyStartOffset(null);
		setCardTransition("");
		setBackCardTransition("none");
		setAnimationPhase("idle");
		setAnimationDirection(null);
		pointerStartX.current = null;
		pointerStartY.current = null;
		if (timeoutRef.current) {
			window.clearTimeout(timeoutRef.current);
		}

		if (pendingSlideInDirectionRef.current !== null) {
			const pendingDirection = pendingSlideInDirectionRef.current;
			pendingSlideInDirectionRef.current = null;
			setAnimationDirection(pendingDirection);
			setAnimationPhase("slide-in");
			timeoutRef.current = window.setTimeout(() => {
				setAnimationPhase("idle");
				setAnimationDirection(null);
				isAnimating.current = false;
			}, SLIDE_IN_MS);
		}
	}, [displayIndex]);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				window.clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const flyOut = useCallback(
		(direction: SwipeDirection, targetIndex: number | null) => {
			if (isAnimating.current) {
				return;
			}
			isAnimating.current = true;

			const startX = dragX;
			const startY = dragY;

			setFlyStartOffset({ x: startX, y: startY });
			setFlyDirection(direction);
			setFlyOffset({ x: startX, y: startY });
			setAnimationDirection(direction);
			setAnimationPhase("slide-out");
			setCardTransition(swipeFlyOutTopTransformTransition());
			setBackCardTransition(
				`transform ${FLY_OUT_MS}ms ease 100ms, background-color ${FLY_OUT_MS}ms ease 100ms`,
			);

			onSwipe?.(direction, displayIndex);

			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					if (direction === "up") {
						setFlyOffset({ x: startX, y: EXIT_OFFSET_Y });
					} else {
						const exitX =
							direction === "right" ? EXIT_OFFSET_X : -EXIT_OFFSET_X;
						setFlyOffset({ x: exitX, y: startY });
					}
				});
			});

			timeoutRef.current = window.setTimeout(() => {
				setFlyOffset(null);
				setFlyDirection(null);
				setFlyStartOffset(null);
				setDragX(0);
				setDragY(0);
				setCardTransition("");
				setBackCardTransition("none");
				setAnimationPhase("idle");
				setAnimationDirection(null);
				isAnimating.current = false;

				if (targetIndex !== null) {
					setDisplayIndex(targetIndex);
					onIndexChange?.(targetIndex);
				} else {
					onExhausted();
				}
			}, FLY_OUT_MS);
		},
		[dragX, dragY, onExhausted, onIndexChange, onSwipe, displayIndex],
	);

	const slideIn = useCallback(
		(direction: SwipeDirection, targetIndex: number) => {
			if (isAnimating.current) {
				return;
			}
			isAnimating.current = true;

			pendingSlideInDirectionRef.current = direction;

			setDisplayIndex(targetIndex);
			onIndexChange?.(targetIndex);
		},
		[onIndexChange],
	);

	const goNext = useCallback(() => {
		if (isAnimating.current) {
			return;
		}
		const direction = onCommit(displayIndex);
		flyOut(direction, nextIndex);
	}, [flyOut, nextIndex, displayIndex, onCommit]);

	const goBack = useCallback(() => {
		if (isAnimating.current) {
			return;
		}
		if (displayIndex === 0) {
			onBefore();
			return;
		}
		const targetIndex = displayIndex - 1;
		const direction = onBack(targetIndex);
		slideIn(direction, targetIndex);
	}, [slideIn, displayIndex, onBefore, onBack]);

	const swipeInDirection = useCallback(
		(dir: SwipeDirection) => {
			if (isAnimating.current) {
				return;
			}
			flyOut(dir, nextIndex);
		},
		[flyOut, nextIndex],
	);

	const swipeLeft = useCallback(
		() => swipeInDirection("left"),
		[swipeInDirection],
	);
	const swipeRight = useCallback(
		() => swipeInDirection("right"),
		[swipeInDirection],
	);
	const swipeUp = useCallback(() => swipeInDirection("up"), [swipeInDirection]);

	useImperativeHandle(
		ref,
		() => ({ goNext, goBack, swipeLeft, swipeRight, swipeUp }),
		[goNext, goBack, swipeLeft, swipeRight, swipeUp],
	);

	const handlePointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (isAnimating.current || !isDraggingEnabled) {
				return;
			}
			(e.target as HTMLElement).setPointerCapture(e.pointerId);
			const rect = e.currentTarget.getBoundingClientRect();
			const localX = e.clientX - rect.left;
			dragStartedLeftHalfRef.current =
				rect.width > 0 ? localX < rect.width / 2 : true;
			pointerStartX.current = e.clientX;
			pointerStartY.current = e.clientY;
			setIsDragging(true);
			setCardTransition("");
			setBackCardTransition("none");
			setDragX(0);
			setDragY(0);
		},
		[isDraggingEnabled],
	);

	const handlePointerMove = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (
				!isDragging ||
				pointerStartX.current === null ||
				pointerStartY.current === null
			) {
				return;
			}
			const rawDx = e.clientX - pointerStartX.current;
			setDragX(
				applyHorizontalDragGravity(rawDx, dragStartedLeftHalfRef.current),
			);
			setDragY(0);
		},
		[isDragging],
	);

	const handlePointerUp = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (
				!isDragging ||
				pointerStartX.current === null ||
				pointerStartY.current === null
			) {
				return;
			}
			const dx = e.clientX - pointerStartX.current;
			const dy = e.clientY - pointerStartY.current;
			pointerStartX.current = null;
			pointerStartY.current = null;
			setIsDragging(false);

			const direction = resolvePointerReleaseSwipeDirection(
				dx,
				dy,
				isSwipeUpGestureEnabled,
			);
			if (direction) {
				flyOut(direction, nextIndex);
			} else {
				setCardTransition(swipeSnapBackTopTransition(SWIPE_SNAP_BACK_MS));
				setBackCardTransition(
					swipeSnapBackStackLayerTransition(SWIPE_SNAP_BACK_MS),
				);

				setDragX(0);
				setDragY(0);
			}
		},
		[isDragging, flyOut, nextIndex, isSwipeUpGestureEnabled],
	);

	const handlePointerCancel = useCallback(() => {
		pointerStartX.current = null;
		pointerStartY.current = null;
		setIsDragging(false);
		setCardTransition(
			swipeSnapBackTopTransition(SWIPE_SNAP_BACK_POINTER_CANCEL_MS),
		);
		setBackCardTransition(
			swipeSnapBackStackLayerTransition(SWIPE_SNAP_BACK_POINTER_CANCEL_MS),
		);

		setDragX(0);
		setDragY(0);
	}, []);

	const backCardContent = renderBackCard ?? renderCard;
	const useKeyframeTopTransform = isSliding;
	const cursorStyle = getCursorStyle(isDraggingEnabled, isDragging);
	const accentBg = getTopCardAccentBg({
		isDragging,
		dragX,
		dragY,
		flyDirection,
		animationDirection,
		accent: horizontalAccentBg,
	});

	const { direction: currentDragDirection, progress: dragProgress } =
		getDragDirectionAndProgress({
			isDragging,
			dragX,
			flyDirection,
			tintContext: {
				animationPhase,
				animationDirection,
			},
		});

	const slideInHorizontalColorFade = slideInHorizontalColorFadeActive(
		horizontalAccentBg,
		isSliding,
		animationDirection,
	);

	const backCardSlideInRecede = isSliding && hasNext;

	const topCardContentOpacity = getTopCardContentOpacity({
		horizontalAccentBg,
		isDragging,
		dragDirection: currentDragDirection,
		dragProgress,
	});
	return (
		<div className="flex min-h-0 w-full flex-1 flex-col pb-3">
			<div
				className={`relative flex min-h-0 w-full flex-1 flex-col ${className}`}
			>
				{/* Ghost card */}
				{hasNext && (
					<div
						aria-hidden="true"
						className="absolute inset-0 -bottom-[37px] w-full bg-gray-300 rounded-3xl pointer-events-none"
						style={{
							zIndex: 0,
							transform: `scale(${stackGhostLayerScale})`,
							opacity: ghostOpacity,
							willChange: "opacity",
						}}
					/>
				)}

				{/* Back card */}
				{hasNext && (
					<div
						aria-hidden="true"
						className={`pointer-events-none absolute inset-0 flex min-h-0 w-full flex-col items-stretch rounded-3xl ${
							backCardSlideInRecede ? "animate-backCardSlideInRecede" : ""
						}`}
						style={{
							zIndex: 1,
							...backCardLayerStyle({
								slideInRecede: backCardSlideInRecede,
								stackGhostLayerScale,
								backCardBackgroundColor,
								backScale,
								backTranslateY,
								backCardTransition,
							}),
						}}
					>
						<div className="flex min-h-0 min-w-0 flex-1 flex-col">
							{backCardContent({
								index: displayIndex + 1,
								dragDirection: null,
								dragProgress: 0,
								slideInHorizontalColorFade: false,
							})}
						</div>
					</div>
				)}

				{/* Top card */}
				<div
					className={`relative flex min-h-0 w-full flex-1 flex-col items-center rounded-3xl ${hasNext ? "shadow-[0_6px_16px_0_rgba(17,24,39,0.10)]" : ""} ${accentBg} ${topCardAnimationClassNames(animationPhase, animationDirection)}`}
					style={{
						zIndex: 2,
						touchAction: "none",
						cursor: cursorStyle,
						userSelect: "none",
						opacity: topCardContentOpacity,
						transform: useKeyframeTopTransform ? undefined : topTransform,
						transition: useKeyframeTopTransform ? undefined : cardTransition,
						pointerEvents: isSliding || isSlidingOut ? "none" : undefined,
					}}
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					onPointerCancel={handlePointerCancel}
				>
					<div className="relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col items-stretch">
						{renderCard({
							index: displayIndex,
							dragDirection: currentDragDirection,
							dragProgress,
							slideInHorizontalColorFade,
						})}
					</div>
				</div>
			</div>
		</div>
	);
});
