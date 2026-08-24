import { useRef, useState, type UIEvent } from "react";
import type { MatchedOccupation } from "@azuki/shared";
import { content } from "../../content";
import { WildcardCard } from "./WildcardCard";

const CARD_WIDTH_PX = 300;
const CARD_GAP_PX = 8;

interface WildcardCarouselProps {
	occupations: MatchedOccupation[];
}

export function WildcardCarousel({ occupations }: WildcardCarouselProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const rowRef = useRef<HTMLDivElement>(null);

	if (occupations.length === 0) {
		return null;
	}

	const handleScroll = (event: UIEvent<HTMLDivElement>) => {
		const cardStride = CARD_WIDTH_PX + CARD_GAP_PX;
		const index = Math.round(event.currentTarget.scrollLeft / cardStride);
		setActiveIndex(Math.min(occupations.length - 1, Math.max(0, index)));
	};

	return (
		<div className="-mx-4 flex flex-col gap-5 bg-sky-100 py-5">
			<h2 className="px-[22px] text-2xl font-semibold text-sky-900">
				{content["results.wildcard.title"]}
			</h2>
			<div
				ref={rowRef}
				onScroll={handleScroll}
				className="flex gap-2 overflow-x-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
			>
				{occupations.map((occupation) => (
					<WildcardCard key={occupation.id} occupation={occupation} />
				))}
			</div>
			{occupations.length > 1 && (
				<div
					className="flex items-center justify-center gap-1"
					aria-hidden="true"
				>
					{occupations.map((occupation, index) => (
						<span
							key={occupation.id}
							className={`size-1.5 rounded-full ${
								index === activeIndex ? "bg-sky-900" : "bg-sky-900/40"
							}`}
						/>
					))}
				</div>
			)}
		</div>
	);
}
