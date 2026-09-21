import { useLayoutEffect, useRef, useState, type UIEvent } from "react";
import type { MatchedOccupation } from "@azuki/shared";
import { content } from "../../content";
import { WildcardCard } from "./WildcardCard";
import { useMatchResultsStore } from "../../store/useMatchResultsStore";

const CARD_WIDTH_PX = 300;
const CARD_GAP_PX = 8;

interface WildcardCarouselProps {
	occupations: MatchedOccupation[];
}

export function WildcardCarousel({ occupations }: WildcardCarouselProps) {
	const wildcardCarouselScrollLeft = useMatchResultsStore(
		(state) => state.wildcardCarouselScrollLeft,
	);
	const setWildcardCarouselScrollLeft = useMatchResultsStore(
		(state) => state.setWildcardCarouselScrollLeft,
	);
	const cardStride = CARD_WIDTH_PX + CARD_GAP_PX;
	const [activeIndex, setActiveIndex] = useState(() =>
		Math.min(
			Math.max(occupations.length - 1, 0),
			Math.max(0, Math.round(wildcardCarouselScrollLeft / cardStride)),
		),
	);
	const rowRef = useRef<HTMLDivElement>(null);
	const initialScrollLeftRef = useRef(wildcardCarouselScrollLeft);

	useLayoutEffect(() => {
		if (rowRef.current) {
			rowRef.current.scrollLeft = initialScrollLeftRef.current;
		}
	}, []);

	if (occupations.length === 0) {
		return null;
	}

	const handleScroll = (event: UIEvent<HTMLDivElement>) => {
		const scrollLeft = event.currentTarget.scrollLeft;
		const index = Math.round(scrollLeft / cardStride);
		setActiveIndex(Math.min(occupations.length - 1, Math.max(0, index)));
		setWildcardCarouselScrollLeft(scrollLeft);
	};

	return (
		<div className="-mx-4 flex flex-col gap-5 bg-sky-100 py-5 mt-7">
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
