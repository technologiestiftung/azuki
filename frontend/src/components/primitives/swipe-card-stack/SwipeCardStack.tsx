import React, {
	useState,
	useRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	forwardRef,
} from "react";

const SWIPE_THRESHOLD = 80;
const FLY_OUT_MS = 400;
const SLIDE_IN_MS = 300;

export type SwipeDirection = "left" | "right";

export interface SwipeCardStackHandle {
	goNext: () => void;
	goBack: () => void;
	swipeLeft: () => void;
	swipeRight: () => void;
}

interface SwipeCardStackProps {
	count: number;
	initialIndex?: number;
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
		onCommit,
		onExhausted,
		onBefore,
		onBack,
		onIndexChange,
		onSwipe,
		renderCard,
		renderBackCard,
		className = "",
	}: SwipeCardStackProps,
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
	const [slideInClass, setSlideInClass] = useState("");

	const pointerStartX = useRef<number | null>(null);
	const pointerStartY = useRef<number | null>(null);
	const isAnimating = useRef(false);
	const timeoutRef = useRef<number | null>(null);
	const pendingSlideInRef = useRef("");

	const isFlying = flyOffset !== null;
	const isSliding = slideInClass !== "";
	const hasNext = displayIndex < count - 1;
	const activeOffset = flyOffset ?? { x: dragX, y: dragY };

	const absX = Math.abs(activeOffset.x);
	const progress = isFlying ? 1 : Math.min(absX / SWIPE_THRESHOLD, 1);
	const backScale = 0.85 + 0.15 * progress;
	const backOpacity = progress;
	const backTranslateY = -43 * (1 - progress);

	const rotate = activeOffset.x / 20;
	const topTransform = `translate(${activeOffset.x}px, ${activeOffset.y}px) rotate(${rotate}deg)`;

	useEffect(() => {
		setIsDragging(false);
		setDragX(0);
		setDragY(0);
		setFlyOffset(null);
		setCardTransition("");
		pointerStartX.current = null;
		pointerStartY.current = null;
		if (timeoutRef.current) {
			window.clearTimeout(timeoutRef.current);
		}

		if (pendingSlideInRef.current !== "") {
			const animClass = pendingSlideInRef.current;
			pendingSlideInRef.current = "";
			setSlideInClass(animClass);
			timeoutRef.current = window.setTimeout(() => {
				setSlideInClass("");
				isAnimating.current = false;
			}, SLIDE_IN_MS);
		} else {
			setSlideInClass("");
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

			const exitX = direction === "right" ? 1000 : -1000;
			setCardTransition("transform 0.4s ease-out");
			setFlyOffset({ x: exitX, y: dragY });

			onSwipe?.(direction, displayIndex);

			timeoutRef.current = window.setTimeout(() => {
				setFlyOffset(null);
				setCardTransition("");
				isAnimating.current = false;

				if (targetIndex !== null) {
					setDisplayIndex(targetIndex);
					onIndexChange?.(targetIndex);
				} else {
					onExhausted();
				}
			}, FLY_OUT_MS);
		},
		[dragY, onExhausted, onIndexChange, onSwipe, displayIndex],
	);

	const slideIn = useCallback(
		(direction: SwipeDirection, targetIndex: number) => {
			if (isAnimating.current) {
				return;
			}
			isAnimating.current = true;

			pendingSlideInRef.current =
				direction === "left" ? "animate-slideInLeft" : "animate-slideInRight";

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
		flyOut(direction, hasNext ? displayIndex + 1 : null);
	}, [flyOut, hasNext, displayIndex, onCommit]);

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
		flyOut("left", hasNext ? displayIndex + 1 : null);
	}, [flyOut, hasNext, displayIndex]);

	const swipeRight = useCallback(() => {
		if (isAnimating.current) {
			return;
		}
		flyOut("right", hasNext ? displayIndex + 1 : null);
	}, [flyOut, hasNext, displayIndex]);

	useImperativeHandle(ref, () => ({ goNext, goBack, swipeLeft, swipeRight }), [
		goNext,
		goBack,
		swipeLeft,
		swipeRight,
	]);

	const handlePointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (isAnimating.current) {
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
		[],
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
			if (!isDragging || pointerStartX.current === null) {
				return;
			}
			const dx = e.clientX - pointerStartX.current;
			pointerStartX.current = null;
			pointerStartY.current = null;
			setIsDragging(false);

			const nextIndex = hasNext ? displayIndex + 1 : null;

			if (dx > SWIPE_THRESHOLD) {
				flyOut("right", nextIndex);
			} else if (dx < -SWIPE_THRESHOLD) {
				flyOut("left", nextIndex);
			} else {
				setCardTransition("transform 0.3s ease");
				setDragX(0);
				setDragY(0);
			}
		},
		[isDragging, flyOut, displayIndex, hasNext],
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

	return (
		<div className={["relative w-full", className].join(" ")}>
			{/* Ghost card */}
			{hasNext && (
				<div
					aria-hidden="true"
					className="absolute inset-0 -top-10 w-full bg-gray-500 rounded-3xl pointer-events-none"
					style={{ zIndex: 0, transform: "scale(0.85)", opacity: 0.4 }}
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
						transition: "none",
						willChange: "transform, opacity",
					}}
				>
					{backCardContent(displayIndex + 1)}
				</div>
			)}

			{/* Top card */}
			<div
				className={[
					"relative w-full bg-gray-200 rounded-3xl pt-5 pb-6 px-6 flex flex-col items-center",
					slideInClass,
				].join(" ")}
				style={{
					zIndex: 2,
					touchAction: "pan-y",
					cursor: isDragging ? "grabbing" : "grab",
					userSelect: "none",
					transform: isSliding ? undefined : topTransform,
					transition: isSliding ? undefined : cardTransition,
					willChange: "transform",
					pointerEvents: isSliding ? "none" : undefined,
				}}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerCancel={handlePointerCancel}
			>
				{renderCard(displayIndex)}
			</div>
		</div>
	);
});
