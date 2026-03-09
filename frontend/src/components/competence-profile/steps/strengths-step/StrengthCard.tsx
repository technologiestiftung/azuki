import { memo } from "react";
import { strengths } from "./strengths";

interface StrengthCardProps {
	index: number;
}

export const StrengthCard = memo(function StrengthCard({
	index,
}: StrengthCardProps) {
	const card = strengths[index];
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
