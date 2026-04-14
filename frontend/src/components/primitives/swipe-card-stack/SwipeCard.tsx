import { memo } from "react";

interface SwipeCardProps {
	cards: {
		illustration: string;
		title: string;
		description: string;
	}[];
	index: number;
	minHeight?: number;
	dragDirection?: "left" | "right" | "up" | null;
	dragProgress?: number;
	swipeOverlay?: {
		leftBg: string;
		rightBg: string;
	};
}

export const SwipeCard = memo(function SwipeCard({
	index,
	cards,
	minHeight = 246,
	dragDirection = null,
	dragProgress = 0,
	swipeOverlay,
}: SwipeCardProps) {
	const card = cards[index];

	if (!card) {
		return null;
	}

	return (
		<div
			className="relative flex flex-col gap-2 items-center"
			style={{ minHeight }}
		>
			<img
				src={card.illustration}
				alt=""
				className="w-[278px]"
				draggable={false}
			/>
			<div className="text-center">
				<h3 className="text-gray-700 text-xl leading-6 font-semibold">
					{card.title}
				</h3>
				<p className="text-base text-gray-700 text-center">
					{card.description}
				</p>
			</div>
			{dragDirection && dragDirection !== "up" && swipeOverlay && (
				<div
					className={`absolute -top-5 -bottom-6 -left-6 -right-6 rounded-3xl pointer-events-none ${dragDirection === "left" ? swipeOverlay.leftBg : swipeOverlay.rightBg}`}
					style={{ opacity: dragProgress * 0.85 }}
				/>
			)}
			{dragDirection && dragDirection !== "up" && (
				<div
					className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[120px] w-[120px] rounded-full bg-orange-0 flex items-center justify-center pointer-events-none"
					style={{ opacity: dragProgress }}
				>
					{dragDirection === "left" ? (
						<img src="/icons/close-black.svg" alt="" className="w-20 h-20" />
					) : (
						<img src="/icons/check-black.svg" alt="" className="w-20 h-20" />
					)}
				</div>
			)}
		</div>
	);
});
