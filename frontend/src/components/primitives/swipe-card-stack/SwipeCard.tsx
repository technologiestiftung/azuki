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
}

export const SwipeCard = memo(function SwipeCard({
	index,
	cards,
	dragDirection = null,
	dragProgress = 0,
	dragColorWash,
}: SwipeCardProps) {
	const card = cards[index];

	if (!card) {
		return null;
	}

	const showColorWash =
		dragColorWash !== undefined &&
		dragDirection !== null &&
		dragDirection !== "up";

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
			{showColorWash && dragColorWash && (
				<div
					aria-hidden
					className={`pointer-events-none absolute inset-0 z-[1] rounded-3xl ${
						dragDirection === "right" ? dragColorWash.right : dragColorWash.left
					}`}
					style={{
						opacity: dragProgress * DRAG_COLOR_WASH_MAX_OPACITY,
					}}
				/>
			)}
			{dragDirection && dragDirection !== "up" && (
				<div
					className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-orange-0"
					style={{ opacity: dragProgress }}
				>
					{dragDirection === "left" ? (
						<img src="/icons/close-black.svg" alt="" className="h-20 w-20" />
					) : (
						<img src="/icons/check-black.svg" alt="" className="h-20 w-20" />
					)}
				</div>
			)}
		</div>
	);
});
