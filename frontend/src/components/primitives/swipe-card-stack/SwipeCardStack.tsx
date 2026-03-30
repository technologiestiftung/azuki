import React, {
	useState,
	useRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	forwardRef,
} from "react";

import {
	detectSwipeDirection,
	FLY_OUT_MS,
	EXIT_OFFSET_X,
	EXIT_OFFSET_Y,
	getCardVisualState,
	getCursorStyle,
	SLIDE_IN_MS,
	topCardAnimationClassNames,
} from "./swipe-card-utils";
import type { AnimationPhase, SwipeDirection } from "./swipe-card-utils";

export type { SwipeDirection };

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
	onCommit: (index: number) => SwipeDirection;
	onExhausted: () => void;
	onBefore: () => void;
	onBack: (newIndex: number) => SwipeDirection;
	onIndexChange?: (index: number) => void;
	onSwipe?: (direction: SwipeDirection, index: number) => void;
	renderCard: (index: number) => React.ReactNode;
	renderBackCard?: (index: number) => React.ReactNode;
	className?: string;
}

export const SwipeCardStack = forwardRef<
	SwipeCardStackHandle,
	SwipeCardStackProps
>(function SwipeCardStack(
	{
		count,
		initialIndex = 0,
		isDraggingEnabled = true,
		onCommit,
		onExhausted,
		onBefore,
		onBack,
		onIndexChange,
		onSwipe,
		renderCard,
		renderBackCard,
		className = "",
	},
	ref,
) {
	const [displayIndex, setDisplayIndex] = useState(initialIndex);
	const [isDragging, setIsDragging] = useState(false);
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

	const pointerStartX = useRef<number | null>(null);
	const pointerStartY = useRef<number | null>(null);
	const isAnimating = useRef(false);
	const timeoutRef = useRef<number | null>(null);
	const pendingSlideInDirectionRef = useRef<SwipeDirection | null>(null);

	const isFlying = flyOffset !== null;
	const isSliding = animationPhase === "slide-in";
	const isSlidingOut = animationPhase === "slide-out";
	const hasNext = displayIndex < count - 1;
	const nextIndex = hasNext ? displayIndex + 1 : null;
	const activeOffset = flyOffset ?? { x: dragX, y: dragY };

	const { backScale, backOpacity, backTranslateY, topTransform } =
		getCardVisualState(activeOffset, isFlying, flyDirection);

	useEffect(() => {
		setIsDragging(false);
		setDragX(0);
		setDragY(0);
		setFlyOffset(null);
		setFlyDirection(null);
		setCardTransition("");
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

			if (direction === "up") {
				setFlyDirection("up");
				setFlyOffset({ x: dragX, y: EXIT_OFFSET_Y });
			} else {
				const exitX = direction === "right" ? EXIT_OFFSET_X : -EXIT_OFFSET_X;
				setFlyOffset({ x: exitX, y: dragY });
			}

			setAnimationDirection(direction);
			setAnimationPhase("slide-out");
			onSwipe?.(direction, displayIndex);

			timeoutRef.current = window.setTimeout(() => {
				setFlyOffset(null);
				setFlyDirection(null);
				setCardTransition("");
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

	const swipeLeft = useCallback(() => {
		if (isAnimating.current) {
			return;
		}
		flyOut("left", nextIndex);
	}, [flyOut, nextIndex]);

	const swipeRight = useCallback(() => {
		if (isAnimating.current) {
			return;
		}
		flyOut("right", nextIndex);
	}, [flyOut, nextIndex]);

	const swipeUp = useCallback(() => {
		if (isAnimating.current) {
			return;
		}
		flyOut("up", nextIndex);
	}, [flyOut, nextIndex]);

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
			pointerStartX.current = e.clientX;
			pointerStartY.current = e.clientY;
			setIsDragging(true);
			setCardTransition("");
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
			setDragX(e.clientX - pointerStartX.current);
			setDragY(e.clientY - pointerStartY.current);
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

			const direction = detectSwipeDirection(dx, dy);
			if (direction) {
				flyOut(direction, nextIndex);
			} else {
				setCardTransition("transform 0.3s ease");
				setDragX(0);
				setDragY(0);
			}
		},
		[isDragging, flyOut, nextIndex],
	);

	const handlePointerCancel = useCallback(() => {
		pointerStartX.current = null;
		pointerStartY.current = null;
		setIsDragging(false);
		setCardTransition("transform 0.5s ease");
		setDragX(0);
		setDragY(0);
	}, []);

	const backCardContent = renderBackCard ?? renderCard;
	const isAnimatingCard = isSliding || isSlidingOut;
	const cursorStyle = getCursorStyle(isDraggingEnabled, isDragging);

	return (
		<div className="flex flex-col w-full justify-center items-center h-fit py-3">
			<div className={`relative w-full ${className}`}>
				{/* Ghost card */}
				{hasNext && (
					<div
						aria-hidden="true"
						className={`absolute inset-0 -bottom-8 w-full bg-gray-300 rounded-3xl pointer-events-none transition-opacity duration-200 ease-in ${isSlidingOut || isDragging ? "opacity-50" : "opacity-100"}`}
						style={{
							zIndex: 0,
							transform: "scale(0.85)",
						}}
					/>
				)}

				{/* Back card */}
				{hasNext && (
					<div
						aria-hidden="true"
						className="absolute inset-0 w-full bg-gray-200 rounded-3xl pt-5 pb-6 px-6 flex flex-col items-center pointer-events-none"
						style={{
							zIndex: 1,
							transform: `scale(${backScale}) translateY(${backTranslateY}px)`,
							opacity: backOpacity,
							transition: isFlying
								? "transform 0.6s ease 0.1s, opacity 0.3s ease 0.1s"
								: "none",
							willChange: "transform, opacity",
						}}
					>
						{backCardContent(displayIndex + 1)}
					</div>
				)}

				{/* Top card */}
				<div
					className={`relative w-full rounded-3xl pt-5 pb-6 px-6 flex flex-col items-center shadow-[0_6px_16px_0_rgba(17,24,39,0.10)] 
						${(isSlidingOut || isDragging) && flyDirection !== "up" ? "bg-sky-300" : "bg-gray-200"} 
						${topCardAnimationClassNames(animationPhase, animationDirection)}`}
					style={{
						zIndex: 2,
						touchAction: "none",
						cursor: cursorStyle,
						userSelect: "none",
						transform: isAnimatingCard ? undefined : topTransform,
						transition: isAnimatingCard ? undefined : cardTransition,
						pointerEvents: isAnimatingCard ? "none" : undefined,
					}}
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					onPointerCancel={handlePointerCancel}
				>
					{renderCard(displayIndex)}
				</div>
			</div>
		</div>
	);
});
