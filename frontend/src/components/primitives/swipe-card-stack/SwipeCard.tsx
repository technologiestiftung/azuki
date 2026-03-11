import { memo } from "react";

interface SwipeCardProps {
	cards: {
		illustration: string;
		title: string;
		description: string;
	}[];
	index: number;
}

export const SwipeCard = memo(function SwipeCard({
	index,
	cards,
}: SwipeCardProps) {
	const card = cards[index];

	if (!card) {
		return null;
	}

	return (
		<div className="flex flex-col gap-2 justify-between items-center">
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
		</div>
	);
});
