import { memo } from "react";

import type { TopCardHorizontalAccentBg } from "./swipe-card-utils";

const DRAG_COLOR_WASH_MAX_OPACITY = 0.85;

interface SwipeCardProps {
	cards: {
		illustration: string;
		title: string;
		description: string;
	}[];
	index: number;
	dragDirection?: "left" | "right" | "up" | null;
	dragProgress?: number;
	dragColorWash?: TopCardHorizontalAccentBg;
	slideInHorizontalColorFade?: boolean;
}

type HorizontalDrag = "left" | "right";

function getSlideInTintClass(
	slideInHorizontalColorFade: boolean,
	dragDirection: SwipeCardProps["dragDirection"],
): string {
	if (!slideInHorizontalColorFade) {
		return "";
	}
	if (dragDirection === "left") {
		return "animate-slideInLeftTint";
	}
	if (dragDirection === "right") {
		return "animate-slideInRightTint";
	}
	return "";
}

function accentClassForHorizontalDrag(
	dragDirection: HorizontalDrag,
	dragColorWash: TopCardHorizontalAccentBg,
): string {
	return dragDirection === "right" ? dragColorWash.right : dragColorWash.left;
}

function HorizontalDragGlyph({ direction }: { direction: HorizontalDrag }) {
	if (direction === "left") {
		return <img src="/icons/close-black.svg" alt="" className="h-20 w-20" />;
	}
	return <img src="/icons/check-black.svg" alt="" className="h-20 w-20" />;
}

interface SwipeCardOverlaysProps {
	showColorWash: boolean;
	dragColorWash: TopCardHorizontalAccentBg | undefined;
	slideInHorizontalColorFade: boolean;
	slideInTintClass: string;
	dragDirection: SwipeCardProps["dragDirection"];
	dragProgress: number;
}

function SwipeCardOverlays({
	showColorWash,
	dragColorWash,
	slideInHorizontalColorFade,
	slideInTintClass,
	dragDirection,
	dragProgress,
}: SwipeCardOverlaysProps) {
	const horizontalDrag =
		dragDirection === "left" || dragDirection === "right"
			? dragDirection
			: null;

	return (
		<>
			{showColorWash && dragColorWash && slideInHorizontalColorFade && horizontalDrag && (
				<div
					aria-hidden
					className={`pointer-events-none absolute inset-0 z-[1] ${slideInTintClass}`}
				>
					<div
						className={`absolute inset-0 rounded-3xl opacity-[0.85] ${accentClassForHorizontalDrag(
							horizontalDrag,
							dragColorWash,
						)}`}
					/>
					<div className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-orange-0">
						<HorizontalDragGlyph direction={horizontalDrag} />
					</div>
				</div>
			)}
			{showColorWash && dragColorWash && !slideInHorizontalColorFade && horizontalDrag && (
				<div
					aria-hidden
					className={`pointer-events-none absolute inset-0 z-[1] rounded-3xl ${accentClassForHorizontalDrag(
						horizontalDrag,
						dragColorWash,
					)}`}
					style={{
						opacity: dragProgress * DRAG_COLOR_WASH_MAX_OPACITY,
					}}
				/>
			)}
			{horizontalDrag && !slideInHorizontalColorFade && (
				<div
					className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-orange-0"
					style={{ opacity: dragProgress }}
				>
					<HorizontalDragGlyph direction={horizontalDrag} />
				</div>
			)}
		</>
	);
}

export const SwipeCard = memo(function SwipeCard({
	index,
	cards,
	dragDirection = null,
	dragProgress = 0,
	dragColorWash,
	slideInHorizontalColorFade = false,
}: SwipeCardProps) {
	const card = cards[index];

	if (!card) {
		return null;
	}

	const showColorWash =
		dragColorWash !== undefined &&
		dragDirection !== null &&
		dragDirection !== "up";

	const slideInTintClass = getSlideInTintClass(
		slideInHorizontalColorFade,
		dragDirection,
	);

	return (
		<div className="relative flex h-full min-h-0 w-full min-w-0 flex-col items-stretch gap-2 self-stretch px-6 pt-5 pb-6">
			<div className="relative z-0 flex min-h-0 w-full flex-1 flex-col items-center gap-3">
				<div className="flex min-h-0 w-full flex-1 items-center justify-center">
					<img
						src={card.illustration}
						alt=""
						className="max-h-full w-full max-w-full object-contain"
						draggable={false}
					/>
				</div>
				<div className="shrink-0 text-center">
					<h3 className="text-xl font-semibold leading-6 text-gray-700">
						{card.title}
					</h3>
					<p className="text-center text-base text-gray-700 max-w-60">
						{card.description}
					</p>
				</div>
			</div>
			<SwipeCardOverlays
				showColorWash={showColorWash}
				dragColorWash={dragColorWash}
				slideInHorizontalColorFade={slideInHorizontalColorFade}
				slideInTintClass={slideInTintClass}
				dragDirection={dragDirection}
				dragProgress={dragProgress}
			/>
		</div>
	);
});
