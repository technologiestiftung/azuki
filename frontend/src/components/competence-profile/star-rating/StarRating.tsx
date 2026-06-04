import React, { useEffect, useRef, useState } from "react";
import { content } from "../../../content";

interface StarRatingProps {
	rating: number;
	maxRating: number;
	onRatingChange?: (rating: number) => void;
}

function starAriaLabel(value: number, max: number): string {
	return content["starRating.starAriaLabel"]
		.replace("{value}", String(value))
		.replace("{max}", String(max));
}

export const StarRating: React.FC<StarRatingProps> = ({
	rating,
	maxRating,
	onRatingChange,
}) => {
	const [isFilled, setIsFilled] = useState(rating);
	const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

	useEffect(() => {
		setIsFilled(rating);
	}, [rating]);

	const focusIndex = isFilled > 0 ? isFilled - 1 : 0;

	function selectRating(value: number) {
		setIsFilled(value);
		onRatingChange?.(value);
	}

	function focusStar(index: number) {
		buttonRefs.current[index]?.focus();
	}

	function handleKeyDown(
		event: React.KeyboardEvent<HTMLButtonElement>,
		index: number,
	) {
		const current = index + 1;
		let nextIndex: number | null = null;

		switch (event.key) {
			case "ArrowRight":
			case "ArrowUp":
				nextIndex = index < maxRating - 1 ? index + 1 : 0;
				break;
			case "ArrowLeft":
			case "ArrowDown":
				nextIndex = index > 0 ? index - 1 : maxRating - 1;
				break;
			case "Home":
				nextIndex = 0;
				break;
			case "End":
				nextIndex = maxRating - 1;
				break;
			case " ":
			case "Enter":
				event.preventDefault();
				selectRating(current);
				return;
			default:
				return;
		}

		event.preventDefault();
		const nextValue = nextIndex + 1;
		selectRating(nextValue);
		focusStar(nextIndex);
	}

	return (
		<div
			role="radiogroup"
			aria-label={content["starRating.groupAriaLabel"]}
			className="flex items-center gap-4"
		>
			{Array.from({ length: maxRating }).map((_, index) => {
				const starValue = index + 1;
				const isSelected = isFilled === starValue;

				return (
					<button
						key={starValue}
						ref={(element) => {
							buttonRefs.current[index] = element;
						}}
						type="button"
						role="radio"
						aria-checked={isSelected}
						aria-label={starAriaLabel(starValue, maxRating)}
						tabIndex={index === focusIndex ? 0 : -1}
						className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
						onClick={() => selectRating(starValue)}
						onKeyDown={(event) => handleKeyDown(event, index)}
					>
						<img
							src="/icons/star.svg"
							alt=""
							aria-hidden
							className={isFilled >= starValue ? "hidden" : "block"}
						/>
						<img
							src="/icons/star-filled.svg"
							alt=""
							aria-hidden
							className={isFilled >= starValue ? "block" : "hidden"}
						/>
					</button>
				);
			})}
		</div>
	);
};
