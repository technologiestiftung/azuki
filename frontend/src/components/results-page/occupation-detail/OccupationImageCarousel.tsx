import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type CSSProperties,
	type PointerEvent as ReactPointerEvent,
} from "react";
import type { OccupationImage } from "@azuki/shared";
import { content } from "../../../content";

const SNAP_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 0.4;
const DRAG_CLICK_THRESHOLD = 5;
const TRANSITION =
	"left 350ms ease-in-out, top 350ms ease-in-out, width 350ms ease-in-out, height 350ms ease-in-out, opacity 350ms ease-in-out";

interface Layout {
	focusW: number;
	focusH: number;
	sideW: number;
	sideH: number;
	gap: number;
	focusLeft: number;
	rightAdjLeft: number;
	leftAdjLeft: number;
	sideTop: number;
}

function computeLayout(viewportW: number): Layout {
	const focusW = viewportW * (358 / 390);
	const focusH = focusW * (238.667 / 358);
	const sideW = viewportW * (330 / 390);
	const sideH = sideW * (220 / 330);
	const gap = 8;
	const focusLeft = (viewportW - focusW) / 2;
	const rightAdjLeft = focusLeft + focusW + gap;
	const leftAdjLeft = focusLeft - gap - sideW;
	const sideTop = (focusH - sideH) / 2;

	return {
		focusW,
		focusH,
		sideW,
		sideH,
		gap,
		focusLeft,
		rightAdjLeft,
		leftAdjLeft,
		sideTop,
	};
}

interface DragState {
	offset: number;
	isDragging: boolean;
}

type SlideRole = "focus" | "adjacent" | "hidden";

const SLIDE_ROLES: Record<
	SlideRole,
	Pick<CSSProperties, "zIndex" | "opacity" | "cursor" | "pointerEvents">
> = {
	focus: { zIndex: 2, opacity: 1, cursor: "grab", pointerEvents: "auto" },
	adjacent: { zIndex: 1, opacity: 1, cursor: "pointer", pointerEvents: "auto" },
	hidden: { zIndex: 0, opacity: 0, cursor: "default", pointerEvents: "none" },
};

function getSlideRole(dist: number): SlideRole {
	if (dist === 0) {
		return "focus";
	}
	if (Math.abs(dist) === 1) {
		return "adjacent";
	}
	return "hidden";
}

function getSlideLeft(dist: number, layout: Layout): number {
	switch (dist) {
		case 0:
			return layout.focusLeft;
		case 1:
			return layout.rightAdjLeft;
		case -1:
			return layout.leftAdjLeft;
		default:
			return dist > 0
				? layout.rightAdjLeft + layout.sideW + layout.gap
				: layout.leftAdjLeft - layout.sideW - layout.gap;
	}
}

function getSlideStyle(
	dist: number,
	layout: Layout,
	drag: DragState,
): CSSProperties {
	const { offset, isDragging } = drag;
	const role = getSlideRole(dist);
	const isFocus = role === "focus";

	return {
		position: "absolute",
		left: getSlideLeft(dist, layout) + offset,
		top: isFocus ? 0 : layout.sideTop,
		width: isFocus ? layout.focusW : layout.sideW,
		height: isFocus ? layout.focusH : layout.sideH,
		...SLIDE_ROLES[role],
		transition: isDragging ? "none" : TRANSITION,
	};
}

function Indicators({
	count,
	current,
	onSelect,
}: {
	count: number;
	current: number;
	onSelect: (index: number) => void;
}) {
	return (
		<div className="flex gap-1 items-center py-1">
			{Array.from({ length: count }).map((_, index) => (
				<button
					key={index}
					type="button"
					aria-label={content[
						"results.detail.images.carousel.slideAriaLabel"
					].replace("{index}", String(index + 1))}
					aria-current={index === current ? "true" : undefined}
					onClick={(event) => {
						event.stopPropagation();
						onSelect(index);
					}}
					className="w-1.5 h-1.5 rounded-full border-none p-0 cursor-pointer shrink-0 transition-opacity duration-[350ms] ease-in-out bg-sky-shade-10"
					style={{
						opacity: index === current ? 1 : 0.7,
						backdropFilter: index === current ? "none" : "blur(2px)",
					}}
				/>
			))}
		</div>
	);
}

interface OccupationImageCarouselProps {
	images: OccupationImage[];
}

export function OccupationImageCarousel({
	images,
}: OccupationImageCarouselProps) {
	const [current, setCurrent] = useState(0);
	const [dragOffset, setDragOffset] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [layout, setLayout] = useState(() => computeLayout(390));
	const trackRef = useRef<HTMLDivElement>(null);
	const pointerStartX = useRef<number | null>(null);
	const pointerStartY = useRef<number | null>(null);
	const dragStartTime = useRef(0);
	const isDraggingRef = useRef(false);
	const dragMovedRef = useRef(false);
	const currentRef = useRef(0);
	const slideCount = images.length;

	const safeCurrent = slideCount === 0 ? 0 : Math.min(current, slideCount - 1);
	currentRef.current = safeCurrent;

	const goTo = useCallback(
		(index: number) => {
			if (index >= 0 && index < slideCount) {
				setCurrent(index);
			}
		},
		[slideCount],
	);

	useEffect(() => {
		setCurrent((index) => Math.min(index, Math.max(0, slideCount - 1)));
	}, [slideCount]);

	useEffect(() => {
		const track = trackRef.current;
		if (!track) {
			return () => {};
		}

		const updateLayout = () => {
			setLayout(computeLayout(track.clientWidth));
		};

		updateLayout();
		const observer = new ResizeObserver(updateLayout);
		observer.observe(track);
		return () => observer.disconnect();
	}, []);

	const resetDrag = useCallback(() => {
		isDraggingRef.current = false;
		setIsDragging(false);
		pointerStartX.current = null;
		pointerStartY.current = null;
		setDragOffset(0);
	}, []);

	const handlePointerDown = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			if (slideCount <= 1) {
				return;
			}
			pointerStartX.current = event.clientX;
			pointerStartY.current = event.clientY;
			dragStartTime.current = Date.now();
			dragMovedRef.current = false;
			isDraggingRef.current = true;
			setIsDragging(true);
			setDragOffset(0);
			event.currentTarget.setPointerCapture(event.pointerId);
		},
		[slideCount],
	);

	const handlePointerMove = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			if (!isDraggingRef.current || pointerStartX.current === null) {
				return;
			}

			const deltaX = event.clientX - pointerStartX.current;
			const deltaY = event.clientY - (pointerStartY.current ?? event.clientY);

			if (
				Math.abs(deltaX) >= DRAG_CLICK_THRESHOLD ||
				Math.abs(deltaY) >= DRAG_CLICK_THRESHOLD
			) {
				dragMovedRef.current = true;
			}

			if (Math.abs(deltaX) > Math.abs(deltaY)) {
				event.preventDefault();
			}

			setDragOffset(deltaX);
		},
		[],
	);

	const handlePointerUp = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			if (!isDraggingRef.current || pointerStartX.current === null) {
				return;
			}

			const dist = event.clientX - pointerStartX.current;
			const elapsed = Date.now() - dragStartTime.current;
			const velocity = Math.abs(dist) / Math.max(elapsed, 1);

			resetDrag();

			if (Math.abs(dist) >= SNAP_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
				if (dist < 0) {
					goTo(currentRef.current + 1);
				} else {
					goTo(currentRef.current - 1);
				}
			}
		},
		[goTo, resetDrag],
	);

	const handlePointerCancel = useCallback(() => {
		dragMovedRef.current = false;
		resetDrag();
	}, [resetDrag]);

	if (slideCount === 0) {
		return null;
	}

	const carouselAriaLabel = content["results.detail.images.carousel.ariaLabel"]
		.replace("{current}", String(safeCurrent + 1))
		.replace("{total}", String(slideCount));

	return (
		<div className="flex flex-col gap-2 w-full">
			<div
				ref={trackRef}
				role="region"
				aria-roledescription="carousel"
				aria-label={carouselAriaLabel}
				tabIndex={slideCount > 1 ? 0 : undefined}
				className="relative w-full overflow-hidden select-none touch-pan-y focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 rounded-[7px]"
				style={{ height: layout.focusH }}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerCancel={handlePointerCancel}
				onKeyDown={(event) => {
					if (event.key === "ArrowRight") {
						event.preventDefault();
						goTo(safeCurrent + 1);
					}
					if (event.key === "ArrowLeft") {
						event.preventDefault();
						goTo(safeCurrent - 1);
					}
				}}
			>
				{images.map((slide, index) => {
					const dist = index - safeCurrent;
					return (
						<div
							key={`${slide.url}-${index}`}
							style={getSlideStyle(dist, layout, {
								offset: isDragging ? dragOffset : 0,
								isDragging,
							})}
							onClick={() => {
								if (!dragMovedRef.current && dist !== 0) {
									goTo(index);
								}
							}}
						>
							<img
								src={slide.url}
								alt={slide.caption}
								className="block w-full h-full object-cover rounded-[20px] pointer-events-none select-none"
								draggable={false}
							/>
						</div>
					);
				})}

				{slideCount > 1 && (
					<div
						className="absolute bottom-0 flex justify-center z-[3] pointer-events-none"
						style={{
							left: layout.focusLeft,
							width: layout.focusW,
							paddingBottom: 4,
						}}
					>
						<div className="pointer-events-auto">
							<Indicators
								count={slideCount}
								current={safeCurrent}
								onSelect={goTo}
							/>
						</div>
					</div>
				)}
			</div>

			<p className="m-0 px-[18px] text-base font-normal text-sky-900 break-words">
				{images[safeCurrent].caption}
			</p>
		</div>
	);
}
